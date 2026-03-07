const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const User = require("../models/User");
const Bite = require("../models/Bite");
const ForumPost = require("../models/ForumPost");
const ForumReply = require("../models/ForumReply");
const ContentRequest = require("../models/ContentRequest");
const SupportTicket = require("../models/SupportTicket");
const Progress = require("../models/Progress");
const Activity = require("../models/Activity");
const QuizAttempt = require("../models/QuizAttempt");
const Topic = require("../models/Topic");

// All admin routes require auth + admin
router.use(auth, admin);

// Basic analytics summary for admin dashboard
router.get("/analytics", async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6); // last 7 days including today

    const [
      totalUsers,
      totalBites,
      totalForumPosts,
      totalForumReplies,
      totalContentRequests,
      totalSupportTickets,
      activeUsersToday,
      activeUsersWeek,
      totalQuizAttempts,
    ] = await Promise.all([
      User.countDocuments({}),
      Bite.countDocuments({}),
      ForumPost.countDocuments({ isDeleted: false }),
      ForumReply.countDocuments({}),
      ContentRequest.countDocuments({}),
      SupportTicket.countDocuments({}),
      User.countDocuments({ lastActiveAt: { $gte: todayStart } }),
      User.countDocuments({ lastActiveAt: { $gte: weekStart } }),
      QuizAttempt.countDocuments({}),
    ]);

    // Line chart data: logins per day (based on lastActiveAt) and bites completed per day
    const activityLine = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(todayStart);
      day.setDate(todayStart.getDate() - i);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      // users whose lastActiveAt is that day are counted as active logins that day
      // (approximation, using "last active" as login/activity marker)
      /* eslint-disable no-await-in-loop */
      const [logins, completedBites] = await Promise.all([
        User.countDocuments({
          lastActiveAt: { $gte: day, $lt: nextDay },
        }),
        Progress.countDocuments({
          completedAt: { $gte: day, $lt: nextDay },
        }),
      ]);

      activityLine.push({
        date: day.toISOString().slice(0, 10),
        logins,
        completedBites,
      });
    }

    // Most "viewed" bites: topics with most completions
    const topCompleted = await Progress.aggregate([
      { $match: { completedAt: { $ne: null } } },
      {
        $group: {
          _id: "$topicId",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const topicIds = topCompleted.map((t) => t._id);
    const topics = await Topic.find({ _id: { $in: topicIds } }).lean();
    const topicsById = topics.reduce((acc, t) => {
      acc[t._id.toString()] = t;
      return acc;
    }, {});
    const mostViewedBites = topCompleted.map((t) => ({
      topicId: t._id,
      name:
        topicsById[t._id.toString()]?.name ||
        `Topic ${t._id.toString().slice(-4)}`,
      count: t.count,
    }));

    // Quiz performance: average score and attempts per topic
    const quizAgg = await QuizAttempt.aggregate([
      {
        $group: {
          _id: "$topicId",
          attempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
      { $sort: { attempts: -1 } },
      { $limit: 8 },
    ]);
    const quizTopicIds = quizAgg.map((q) => q._id);
    const quizTopics = await Topic.find({ _id: { $in: quizTopicIds } }).lean();
    const quizTopicsById = quizTopics.reduce((acc, t) => {
      acc[t._id.toString()] = t;
      return acc;
    }, {});
    const quizPerformance = quizAgg.map((q) => ({
      topicId: q._id,
      topicName:
        quizTopicsById[q._id.toString()]?.name ||
        `Topic ${q._id.toString().slice(-4)}`,
      attempts: q.attempts,
      avgScore: q.avgScore != null ? Math.round(q.avgScore) : null,
    }));

    res.json({
      totalUsers,
      totalBites,
      totalForumPosts,
      totalForumReplies,
      totalContentRequests,
      totalSupportTickets,
      activeUsersToday,
      activeUsersWeek,
      totalQuizAttempts,
      activityLine,
      mostViewedBites,
      quizPerformance,
    });
  } catch (err) {
    console.error("Failed to fetch admin analytics", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

module.exports = router;

