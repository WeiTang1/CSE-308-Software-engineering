'use strict';

var articles = require('../controllers/articles');
var mongoose = require('mongoose');
var Course = mongoose.model('Course');
var User = mongoose.model('User');
var FriendRequest = mongoose.model('FriendRequest');
var School = mongoose.model('School');
var Section = mongoose.model('Section');
var Criteria = mongoose.model('Criteria');
// Article authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.article.user.id !== req.user.id) {
    return res.status(401).send('User is not authorized');
  }
  next();
};


module.exports = function(Articles, app, auth) {
  app.route('/articles')
    .get(articles.all)
    .post(auth.requiresLogin, articles.create);

  app.get('/user/friends',function(req,res){
    console.log('reqbody'+req.query.username);
      User.findOne({username: req.query.username}).populate('friends').exec(function(err,person){
      if(err)
        res.send(err);
      res.json(person);
    });

  });

  app.get('/user/sections',function(req,res){
    User.findOne({email: req.query.userEmail}).populate('assignedSchedule').exec(function(err,person){
      if(err)
        res.send(err);
      res.json(person);
    });
  });

  app.post('/getSchool',function(req,res){
    console.log('Getting school on server...');
    School.findOne({schoolName: req.body.schoolName},function(err,school){
      if(err)
        res.send(err);
      res.json(school);
      console.log('Sent school back');
    });
  });

  app.post('/user/findByFirstLastName',function(req,res){
    console.log('Finding by first,last name on server...');
    User.find({
      firstName: req.body.firstName,
      lastName: req.body.lastName
      },
      function(err,users){
      if(err)
        res.send(err);
      res.json(users);
    });
  });

  app.post('/user/removeFromAssignedSchedule',function(req,res){
    console.log('Removing from assigned schedule...');
    User.update({email: req.body.email},
      {$pull:
        {assignedSchedule: mongoose.Types.ObjectId(req.body.section_id)}},
        function(err,doc){
          if(err){
            console.log('Error removing from assigned schedule(server)');
          }
          console.log('Success remove assigned schedule section(server)');
          res.sendStatus(200);
    });
  });

  app.post('/user/areFriends',function(req,res){
    console.log('Testing friend relationship on server...');
    User.findOne({username: req.body.currentUsername, friends: req.body.potentialFriend},function(err,person){
      console.log(person);
      if(err)
        res.send(err);
      res.json(person);
    });
  });

  app.post('/user/addFriend',function(req,res){
    console.log('Adding friend request for:'+req.body.requester+' '+req.body.requestee);
    var friendReq = new FriendRequest(req.body);
    friendReq.save(function(err){
      if(err){
        console.log('error adding request to db.');
        res.status(400);
      }
      res.send('Success');
    });

  });

  app.post('/user/getFriendRequestsByRequester',function(req,res){
    console.log('Getting friend requests by requester');
    FriendRequest.find({requester: mongoose.Types.ObjectId(req.body.requester)}).populate('requester requestee').exec(function(err,data){
      if(err)
        res.send(err);
      res.json(data);
    });
  });

  app.post('/user/getFriendRequestsByRequestee',function(req,res){
    console.log('Getting friend requests table. reqbody.requestee= ' + req.body.requestee);
    FriendRequest.find({requestee: mongoose.Types.ObjectId(req.body.requestee)}).populate('requester requestee').exec(function(err,data){
      console.log('Friend Requests '+ data);
      if(err)
        res.send(err);
      console.log('success http post friend requests');
      res.json(data);
    });
  });

  app.get('/user/students',function(req,res){
    User.find().sort('username').exec(function(err,data){
      console.log(data);
      if(err)
        res.send(err);
      res.json(data);
    });
  });

  app.post('/addSectionToCourse',function(req,res){
    console.log('Adding section to course...');
    var section = new Section({
      courseId: req.body.courseId,
      courseName: req.body.courseName,
      school: req.body.school,
      semester: req.body.semester,
      professor: req.body.professor,
      scheduleBlock:req.body.scheduleBlock
    });
    section.save(function(err){
      if(err){
        console.log('Error creating section');
      }
      Course.update({_id: mongoose.Types.ObjectId(req.body.course_id)},
      {$push: {sections: mongoose.Types.ObjectId(section._id)}},
      function(err,doc){
        console.log('Successfully added section to course!!!!!!');
        if(err){
          console.log('Error adding section to course');
        }
        res.send('Successfully added section to course.');
      });
    });
  });

  app.post('/user/declineFriendRequest',function(req,res){
    console.log('req.body.requester='+req.body.requester+'req.body.requestee'+req.body.requestee);
    FriendRequest.findOneAndRemove({
      requester: mongoose.Types.ObjectId(req.body.requester),
      requestee: mongoose.Types.ObjectId(req.body.requestee)},
      function(err,doc){
      res.send('Successfully declined friend');
    });
  });

  app.post('/user/acceptFriendRequest',function(req,res){
    console.log('req.body.requester='+req.body.requester+' req.body.requestee='+req.body.requestee);
    User.update({_id: mongoose.Types.ObjectId(req.body.requester)},
    {$push: {friends: mongoose.Types.ObjectId(req.body.requestee)}},
    function(err,doc){

    });
    User.update({_id: mongoose.Types.ObjectId(req.body.requestee)},
    {$push: {friends: mongoose.Types.ObjectId(req.body.requester)}},
    function(err,doc){
      console.log('Accepting friend request...');
      if(err)
        res.send(err);
      console.log('Successfuly accepted friend request');
      FriendRequest.findOneAndRemove({
        requester: mongoose.Types.ObjectId(req.body.requester),
        requestee: mongoose.Types.ObjectId(req.body.requestee)},
        function(err,doc){
        res.send('Successfully accepted friend!');
      });


    });
  });

  app.delete('/user/removeFriend',function(req,res){
    console.log('friendName='+req.query.friendId+' username='+req.query.userId);
    User.update({_id: mongoose.Types.ObjectId(req.query.userId)},{$pull: {friends: mongoose.Types.ObjectId(req.query.friendId)}},function(err,doc){
      // if(err)
      //   res.send(err);
      //
      // res.json(doc);
    });
    User.update({_id: mongoose.Types.ObjectId(req.query.friendId)},{$pull: {friends: mongoose.Types.ObjectId(req.query.userId)}},function(err,doc){
      if(err)
        res.send(err);

      res.json(doc);
    });
    // User.findOne({username: req.query.username}).remove()
  });

  app.route('/getCoursesOffering').post(function(req, res) {
    Section.find({school: req.body.school}).sort('courseId').exec(function(err,data){
      if(err)
        res.send('error here');
      console.log(data);
      res.json(data);
    });
  });

  app.route('/articles/:articleId')
  .get(articles.show)
  .put(auth.requiresLogin, hasAuthorization, articles.update)
  .delete(auth.requiresLogin, hasAuthorization, articles.destroy);
    // .get(auth.isMongoId, articles.show)
    // .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, articles.update)
    // .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, articles.destroy);
  app.post('/searchForCourse',function(req,res){
    Course.findOne({
      courseId: req.body.courseId,
      schoolName: req.body.schoolName,
      semester: req.body.semester
    }).populate('sections').exec(function(err, course){
      if(err){
        console.log('Error finding course...');
        res.send(err);
      }
      //if no course has the current semester and courseID then course = null?
      if(course === null){
        Course.findOne({
          courseId: req.body.courseId,
          schoolName: req.body.schoolName,
          semester: {$ne: req.body.semester}
        },function(err, previousSemesterCourse){
          res.json(previousSemesterCourse);
        });
      }else{
        res.json(course);
      }

    });

  });

  app.post('/addSectionToAssignedSchedule',function(req,res){
    //working add sec to assigned schedule
      // User.update({username: req.body.username},
      //   {$addToSet: {assignedSchedule: mongoose.Types.ObjectId(req.body.sectionId)}},
      //   function(err,user){
      //     if(err){
      //       console.log('Error pushing section to users assigned schedule');
      //       res.send(err);
      //     }
      //     res.json(user);
      //   });
      User.findOne({username: req.body.username, assignedSchedule: {$nin: [mongoose.Types.ObjectId(req.body.sectionId)]}},
        function(err,user){
          if(err){
            console.log('Couldnt find user....');
            res.send(err);
          }else{
            if(user !== null){
              user.assignedSchedule.push(req.body.sectionId);
              user.save(function(err){

              });
              res.send('Section added to assigned schedule');
            }else{
              res.send('Section already exists in your assigned schedule');
            }
          }
      });
  });

  app.route('/user/currentUser')
    .get(function(req,res){
      console.log('getting user info...');
      // User.findOne({email: req.query.email})
      // .populate('friends assignedSchedule desiredSchedule criteria')
      // .exec(function(err,user){
      //   if(err)
      //     res.send(err);
      //   console.log('Successfully got user info!');
      //   res.json(user);
      // });
      User.findOne({email: req.query.email})
      .populate('friends assignedSchedule desiredSchedule criteria')
      .exec(function(err,user){
        Criteria.populate(user.criteria,
          {path: 'courses.excludedSections'},
          function(err,cri){
            res.json(user);
        });
      });
    });

  app.route('/addSchool')
    .post(articles.createSchool);
  app.post('/school/currentSemester',function(req,res){
    console.log('getting current semester...');
    School.find({schoolName: req.body.schoolName},
      function(err,schools){
      if(err){
        console.log('error getting current semester...');
        res.send(err);
      }
      console.log('Got current semester now entering for loop...schools='+schools);
      for(var i=0;i<schools.length;i+=1){
        console.log('currentsemester='+schools[i].currentSemester+'semester='+schools[i].semester);
        if(schools[i].currentSemester === schools[i].semester){
          res.json(schools[i]);
        }
      }
    });
  });
  app.route('/addSection')
    .post(articles.addSection);

  app.route('/addCourse')
    .post(articles.createCourse);
  // Finish with setting up the articleId param
  //app.param('articleId', articles.article);
  // app.route('/articles/viewcourseoffering')
  //   .get(courses.all);
  app.get('/courses',function(req,res){
    console.log('Find course in route server');
    Course.find(function(err,courses){
      if(err)
        res.send(err);

      res.json(courses);
    });
  });

  app.post('/getCriteria', function (req, res){
    // console.log('code was hereeere');
    Criteria.findOne({user: req.body.username}).exec(function(err, docs){
      var option = {
        path: 'courses.excludedSections',
        model: 'Section'
      };
      if(err) return res.json(500);
      Criteria.populate(docs, option, function(err, criteria){
        // console.log('criteria is '+ JSON.stringify(criteria));
        res.json(criteria);
      });
    });


  });

  app.post('/addToCriteria', function(req, res) {
    console.log('addToCriteria...');
    var excludedSectionsId = [];
    for(var i =0 ; i < req.body.excludedSections.length; i +=1) {
      excludedSectionsId.push(mongoose.Types.ObjectId(req.body.excludedSections[i]));
    }
    console.log('addToCriteria...');
    Criteria.update(
      {user: req.body.username},
      {user: req.body.username,
      $push: {
        courses: {
          courseId: req.body.courseId,
          preferedInstructors: req.body.preferedInstructors,
          excludedSections: excludedSectionsId
        }
      },
      lunch: req.body.lunch
    },
    {
    upsert: true
    }, function(err,data){
      console.log('addToCriteria...');
      if(err) res.send(err);
      res.json(data);
      Criteria.findOne({user: req.body.username},function(err,cri){
        User.update({username: req.body.username},
          {criteria: cri._id},
          function(err,user){
            if(err){
              console.log('Error adding criteria to user...');
            }
            console.log('Successfully added criteria to user...');
        });
      });
      });
    });

    app.post('/removeCourseFromCriteria', function(req, res) {

      Criteria.update({user: req.body.user}, {$pull: { courses: {courseId: req.body.course}}}, function(err, data){
        if(err) res.send(err);
        res.json(data);
      });
    });
    app.post('/updateLunch', function (req, res){
      console.log('this is what i think it does');
      Criteria.update({user: req.body.user}, {lunch: req.body.lunch},{upsert:true}, function (err, data){
        if(err) res.send(err);
        res.json(data);
      });
    });

    app.post('/user/courses',function(req,res){
      Course.find({
        schoolName: req.body.school
      }).populate('sections')
      .exec(function(err,courses){
        console.log('Getting courses from user school....');
        if(err){
          res.send(err);
        }

        //console.log('courses='+courses);
        res.json(courses);
    });
    });

    //the request form should be $http.post('generateDesiredSchedule', { user: $scope.global.user})
    app.route('/generateDesiredSchedule').post(articles.generateDesiredSchedule);

};
