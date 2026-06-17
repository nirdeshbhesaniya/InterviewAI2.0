const mongoose = require('mongoose');

const roadmapProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  roadmapId: { 
    type: String, 
    required: true 
  },
  completedTopics: [{ 
    type: String 
  }],
  clearedModules: [{
    type: String
  }],
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Ensure a user only has one progress record per roadmap
roadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

module.exports = mongoose.model('RoadmapProgress', roadmapProgressSchema);
