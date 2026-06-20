const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect } = require('../middleware/auth');

// Route guard to ensure only the developer/admin can fetch stats
const adminOnly = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (user && (user.role === 'admin' || user.email === 'premchandarreddy3010@gmail.com')) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied: Admin role required.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/admin/stats
// @desc    Get system statistics and feature usage logs
// @access  Private/Admin
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    // Fetch logs from Supabase activity_logs table
    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*, user:profiles(name, email)')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) throw new Error(error.message);

    // 1. Group and count actions in memory (Fast and RLS-safe)
    const countsMap = {};
    logs.forEach(log => {
      countsMap[log.action] = (countsMap[log.action] || 0) + 1;
    });
    const actionCounts = Object.keys(countsMap).map(action => ({
      _id: action,
      count: countsMap[action]
    })).sort((a,b) => b.count - a.count);

    // 2. Count unique daily active users (DAU) in memory
    const dailyActiveMap = {};
    logs.forEach(log => {
      const day = new Date(log.timestamp).toISOString().split('T')[0];
      if (!dailyActiveMap[day]) {
        dailyActiveMap[day] = new Set();
      }
      dailyActiveMap[day].add(log.user_id);
    });

    const dailyActive = Object.keys(dailyActiveMap).map(day => ({
      _id: day,
      uniqueUsersCount: dailyActiveMap[day].size
    })).sort((a,b) => b._id.localeCompare(a._id)).slice(0, 30);

    // 3. User usage overview (Map keys to MongoDB format for frontend compatibility)
    const recentLogs = logs.slice(0, 100).map(log => ({
      _id: log.id,
      user: log.user ? {
        id: log.user_id,
        name: log.user.name,
        email: log.user.email
      } : null,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp
    }));

    res.status(200).json({
      success: true,
      actionCounts,
      dailyActive,
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
