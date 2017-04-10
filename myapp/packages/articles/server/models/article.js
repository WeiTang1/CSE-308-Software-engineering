'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  var CriteriaSchema = new Schema({
    user: String,
    courses: [
      {
        _id: false,
       courseId: String,
       preferedInstructors: [String],
       excludedSections: [{type: Schema.Types.ObjectId, ref: 'Section'}],
      }
    ],
    lunch: [Boolean]
  });

  mongoose.model('Criteria', CriteriaSchema);

  var CourseSchema = new Schema({
    courseId:String,
    courseName:String,
    schoolName: String,
    semester: String,//populate will find satisfying entries, then replace sectionIds with section objects
    sections: [{type: Schema.Types.ObjectId, ref: 'Section'}]//use populate Ex: Courses.findById(req.courseId).populate('sections').exec(function(err, user){console.log(user.subscribing);})
  });
mongoose.model('Course',CourseSchema);

var SectionSchema = new Schema({
  courseId: String,
  courseName: String,
  school: String,
  semester: String,
  professor: String,
  scheduleBlock: {period: Number, days: [Number]}
});

mongoose.model('Section',SectionSchema);




var FriendRequestSchema = new Schema({
    requester: {type: Schema.Types.ObjectId, ref: 'User'},
    requestee: {type: Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('FriendRequest',FriendRequestSchema);

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Validations
 */
ArticleSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

ArticleSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');

/**
 * Statics
 */
ArticleSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Article', ArticleSchema);
