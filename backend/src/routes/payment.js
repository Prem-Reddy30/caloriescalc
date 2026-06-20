const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');
const { logActivity } = require('../utils/activityLogger');

// @route   POST /api/payment/confirm
// @desc    Confirm and record a custom UPI payment using UTR
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { utr, amount, requestDetails } = req.body;

    if (!utr || !/^\d{12}$/.test(utr.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid or missing 12-digit UTR.' });
    }

    // Insert payment record into Supabase payments table
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{
        user_id: req.user.id,
        utr: utr.trim(),
        amount: amount ? parseFloat(amount) : 99.00,
        status: 'pending',
        request_details: requestDetails || {}
      }])
      .select()
      .single();

    if (error) {
      // 23505 is PostgreSQL unique constraint violation error code (duplicate UTR)
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'This UTR Transaction ID has already been submitted.' });
      }
      throw new Error(error.message);
    }

    // Log activity
    await logActivity(req.user.id, 'activity_logged', { 
      type: 'payment_submitted', 
      utr: utr.trim(), 
      amount: amount || 99 
    });

    res.status(200).json({
      success: true,
      message: 'Payment details recorded successfully in database.',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payment/history
// @desc    Get current user's payment submissions
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
