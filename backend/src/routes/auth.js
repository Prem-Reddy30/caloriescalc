const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/emailSender');
const { generateOfferHtml } = require('../utils/emailTemplate');
const { logActivity } = require('../utils/activityLogger');

const { mapProfileToMongoUser } = require('../utils/profileMapper');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const { data: userExists, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in Supabase profiles table
    const { data: user, error: createError } = await supabase
      .from('profiles')
      .insert([{
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user'
      }])
      .select()
      .single();

    if (createError) {
      console.error('Supabase createError:', createError);
      return res.status(500).json({ message: createError.message, fullError: createError, location: 'supabase_insert' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    // Send Diet Plan Offer Email asynchronously
    sendEmail({
      to: user.email,
      subject: '🔥 Special Offer: Get Your Customized Diet Plan for just ₹99!',
      html: generateOfferHtml({ name: user.name })
    }).catch(err => console.error('Failed to send offer email on registration:', err));

    // Log registration
    await logActivity(user.id, 'user_registered', { method: 'email' });

    res.status(201).json({
      success: true,
      token,
      user: mapProfileToMongoUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const { data: user, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    // Send Diet Plan Offer Email asynchronously
    sendEmail({
      to: user.email,
      subject: '🔥 Special Offer: Get Your Customized Diet Plan for just ₹99!',
      html: generateOfferHtml({ name: user.name })
    }).catch(err => console.error('Failed to send offer email on login:', err));

    // Log login
    await logActivity(user.id, 'user_logged_in', { method: 'email' });

    res.status(200).json({
      success: true,
      token,
      user: mapProfileToMongoUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/google-login
// @desc    Login or register user via Google Firebase
// @access  Public
router.post('/google-login', async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required from Google account.' });
    }

    // Check if user exists
    let { data: user, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      // Create user with Google provider
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert([{
          name: name || 'Google User',
          email: email.toLowerCase(),
          google_id: googleId,
          role: 'user'
        }])
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }
      user = newUser;
      console.log(`Created new social login user in Supabase: ${email}`);

      // Send Diet Plan Offer Email asynchronously if user was just created
      sendEmail({
        to: user.email,
        subject: '🔥 Special Offer: Get Your Customized Diet Plan for just ₹99!',
        html: generateOfferHtml({ name: user.name })
      }).catch(err => console.error('Failed to send offer email on Google login:', err));
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    // Log registration or login for Google
    if (isNewUser) {
      await logActivity(user.id, 'user_registered', { method: 'google' });
    } else {
      await logActivity(user.id, 'user_logged_in', { method: 'google' });
    }

    res.status(200).json({
      success: true,
      token,
      user: mapProfileToMongoUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: mapProfileToMongoUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email.toLowerCase();

    // Map nested Mongo-like request structure flat to SQL columns
    if (req.body.profile) {
      const p = req.body.profile;
      if (p.age !== undefined) updateData.age = parseInt(p.age);
      if (p.gender !== undefined) updateData.gender = p.gender;
      if (p.height !== undefined) updateData.height = parseFloat(p.height);
      if (p.weight !== undefined) updateData.weight = parseFloat(p.weight);
      if (p.activityLevel !== undefined) updateData.activity_level = p.activityLevel;
      if (p.goal !== undefined) updateData.goal = p.goal;
      if (p.dietaryPreference !== undefined) updateData.dietary_preference = p.dietaryPreference;
      if (p.budget !== undefined) updateData.budget = parseFloat(p.budget);
      if (p.calorieGoal !== undefined) updateData.calorie_goal = parseInt(p.calorieGoal);
    }

    const { data: user, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    res.status(200).json({
      success: true,
      user: mapProfileToMongoUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
