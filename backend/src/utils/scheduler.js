const cron = require('node-cron');
const supabase = require('../config/supabase');
const { sendEmail } = require('./emailSender');
const { generateSummaryHtml, generateOfferHtml } = require('./emailTemplate');
const { 
  calculateBMR, 
  calculateTDEE, 
  calculateCalorieGoal, 
  calculateWaterIntake 
} = require('./healthCalculators');

const sendDailySummaries = async () => {
  console.log('Daily summary cron task triggered...');
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const logDateStr = todayStart.toISOString().split('T')[0];

    // Find progress logs for today that have not received an email
    const { data: logs, error } = await supabase
      .from('daily_progress')
      .select('*, user:profiles(*)')
      .eq('date', logDateStr)
      .eq('summary_email_sent', false);

    if (error) throw new Error(error.message);

    console.log(`Found ${logs.length} pending summaries for today.`);

    for (const log of logs) {
      const user = log.user;
      if (!user || !user.email) continue;

      // Fetch food entries
      const { data: foods } = await supabase
        .from('logged_foods')
        .select('*')
        .eq('progress_id', log.id);

      const foodList = (foods || []).map(f => ({
        name: f.name,
        cal: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        emoji: f.emoji || '🍽️'
      }));

      // Extract user info
      const name = user.name;
      const email = user.email;
      const age = user.age || 25;
      const weight = log.weight || user.weight || 70;
      const height = user.height || 175;
      const gender = user.gender || 'male';
      const activityLevel = user.activity_level || 'moderate';
      const goalType = user.goal || 'maintenance';

      // Re-calculate target values matching utils.ts algorithms
      const bmr = calculateBMR(gender, +weight, +height, +age);
      const tdee = calculateTDEE(bmr, activityLevel);
      const targetCalories = calculateCalorieGoal(tdee, goalType);
      const waterGoal = Math.round(calculateWaterIntake(+weight, activityLevel) * 1000);

      // Build HTML
      const html = generateSummaryHtml({
        name,
        date: todayStart.toDateString(),
        weight,
        caloriesConsumed: log.calories_consumed || 0,
        targetCalories,
        waterIntake: log.water_intake || 0,
        waterGoal,
        foods: foodList,
        workoutCompleted: log.workout_completed
      });

      // Send the mail
      try {
        await sendEmail({
          to: email,
          subject: `NutriBudget AI – Your Daily Summary (${todayStart.toLocaleDateString()})`,
          html
        });

        // Mark as sent in Supabase
        await supabase
          .from('daily_progress')
          .update({ summary_email_sent: true })
          .eq('id', log.id);

        console.log(`Successfully emailed daily summary to ${email}`);
      } catch (sendErr) {
        console.error(`Error sending email to ${email}:`, sendErr);
      }
    }
  } catch (err) {
    console.error('Error in cron job summary sender:', err);
  }
};

const sendDailyDietOffers = async () => {
  console.log('Daily diet offer cron task triggered...');
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('name, email');

    if (error) throw new Error(error.message);

    console.log(`Sending daily diet offer to ${users.length} users.`);
    for (const user of users) {
      if (!user.email) continue;
      const html = generateOfferHtml({ name: user.name });
      try {
        await sendEmail({
          to: user.email,
          subject: '🔥 Special Offer: Get Your Customized Diet Plan for just ₹99!',
          html
        });
        console.log(`Successfully emailed daily diet offer to ${user.email}`);
      } catch (sendErr) {
        console.error(`Error sending daily diet offer to ${user.email}:`, sendErr);
      }
    }
  } catch (err) {
    console.error('Error in daily diet offer scheduler:', err);
  }
};

const startDailySummaryCron = () => {
  // Cron schedule: Run everyday at 23:00 (11:00 PM) local server time
  console.log('Initializing Daily Summary Scheduler (Runs at 23:00 / 11:00 PM every day)...');
  cron.schedule('0 23 * * *', sendDailySummaries);

  // Cron schedule: Run everyday at 10:00 AM local server time
  console.log('Initializing Daily Premium Diet Offer Scheduler (Runs at 10:00 AM every day)...');
  cron.schedule('0 10 * * *', sendDailyDietOffers);
};

module.exports = {
  startDailySummaryCron,
  sendDailySummaries,
  sendDailyDietOffers
};
