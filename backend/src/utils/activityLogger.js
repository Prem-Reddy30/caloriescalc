const supabase = require('../config/supabase');

const logActivity = async (userId, action, details = {}) => {
  try {
    if (!userId) return;
    const { error } = await supabase
      .from('activity_logs')
      .insert([{
        user_id: userId,
        action,
        details
      }]);

    if (error) throw new Error(error.message);
  } catch (err) {
    console.error(`Failed to log activity [${action}] for user [${userId}]:`, err.message);
  }
};

module.exports = { logActivity };
