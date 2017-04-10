'use strict';

/**
 * Module dependencies.
 */
 // User = mongoose.model('User'),
var mongoose = require('mongoose'),
School = mongoose.model('School'),
Course = mongoose.model('Course'),
  Article = mongoose.model('Article'),
  Section = mongoose.model('Section'),
  _ = require('lodash');
  /* jshint ignore:start */
var User = mongoose.model('User');
/* jshint ignore:end */
var Criteria= mongoose.model('Criteria');
var allSchedule = [];
var acceptableSchedule = [];
var profOptimizedSchedule = [];
var friendOptimizedSchedule = [];
var i, j =0;
/**
 * Find article by id
 */
exports.article = function(req, res, next, id) {
  Article.load(id, function(err, article) {//load is static method in article model (server) that was originally commented, I commented it out.
    if (err) return next(err);
    if (!article) return next(new Error('Failed to load article ' + id));
    req.article = article;
    next();
  });
};


exports.createSchool = function(req,res,next){
    var school = new School(req.body);
    console.log('Adding school...');
    school.save(function(err){
        if(err){
          res.sendStatus(400);
        }else{
          console.log('Successfully added school!...Now updating current semester of schools...');
          //update currentSemester of schools with same name
          School.update({schoolName: req.body.schoolName},
            {currentSemester: req.body.currentSemester},{multi:true},
            function(err,schools){
              if(err){
                res.send(err);
              }
              console.log('Successfully updated currentSemester of schools...');
              res.sendStatus(200);
            });

      }
    });
};

exports.createCourse = function(req,res,next){
    var course = new Course(req.body);
    console.log('Creating course...saving to database');
    course.save(function(err){
        if(err){
          return res.send(err);
        }
        res.json(course);
    });
};

exports.addSection = function(req,res){
    console.log('Adding section to database...');

    var section = new Section({

      courseId:req.body.courseId,
      courseName: req.body.courseName,
      school: req.body.school,
      semester: req.body.semester,
      professor: req.body.professor,
      scheduleBlock: req.body.scheduleBlock
    });
    section.save(function(err){
      if(err){
        console.log('Error saving section...');
        res.send('error saving section');
      }
      //add section _id to corresponding course
      console.log('Adding section to course...');
      Course.update({_id: mongoose.Types.ObjectId(req.body.course_id)},{$push: {sections: section._id}},function(err,doc){
        console.log('Successfully added section to course!');
      });
      res.json(section);
    });
};
/**
 * Create an article
 */
exports.create = function(req, res) {
  var article = new Article(req.body);
  article.user = req.user;

  article.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot save the article'
      });
    }
    res.json(article);

  });
};

/**
 * Update an article
 */
exports.update = function(req, res) {
  var article = req.article;

  article = _.extend(article, req.body);

  article.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot update the article'
      });
    }
    res.json(article);

  });
};

/**
 * Delete an article
 */
exports.destroy = function(req, res) {
  var article = req.article;

  article.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the article'
      });
    }
    res.json(article);

  });
};

/**
 * Show an article
 */
exports.show = function(req, res) {
  res.json(req.article);
};

/**
 * List of Articles
 */
exports.all = function(req, res) {
  Article.find().sort('-created').populate('user', 'name username').exec(function(err, articles) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the articles'
      });
    }
    res.json(articles);

  });


};
//Hung Pham
//generate desire schedule start here

//helper methods
//backtracking to get all the combination of schedule
function backtracking(input, k, res) {
  // console.log('input is ' + JSON.stringify(input));

  if(k >= input.length) {
    // console.log('res is ' + JSON.stringify(res));
    allSchedule.push(res);
  }
  else {
    for(var n = 0; n < input[k].length; n +=1) {
      // console.log('k is ' + k + 'n is ' + n);
      var newArr = res.slice();
      newArr.push(input[k][n]);
      backtracking(input, k +1, newArr);
    }
  }
}
//count the time conflict of a schedule
function conflictCount(sc, day, period) {
  var result = {
    conflict: 0, conflictItems:[]
  };
  //create boolean check array
  var occupied = [];

  for(var n1 = 0; n1 < day; n1 +=1) {
    occupied[n1] = [];
    for(var m1 = 0; m1< period; m1 +=1) {
      occupied[n1][m1] = false;
    }
  }

  //count the conflict and the conflict items
  for(var n2 = 0; n2 < sc.length; n2+=1) {
    var conflict = false;
    var sect = sc[n2];
    var sectP = sect.scheduleBlock.period;
    var sectD = sect.scheduleBlock.days;
    // console.log('sect schedule block is ' + sect.scheduleBlock);
    //first loop through all the blocks to see if conflict happens. if it does then conflict ++ and continue to the next section
    //if itdoesnt then change the section's block occupied to true
    for(var m2 = 0; m2 < sectD.length; m2 +=1) {
      console.log(' day ' + sectD[m2] + ' period ' + sectP);
      if(occupied[sectD[m2]-1][sectP-1]) {
        conflict = true;
        console.log('conflict');
        result.conflict +=1;
        result.conflictItems.push(sect.courseId);
        break;
      }
    }
    if(conflict) continue;
    for(var m3   = 0; m3 < sectD.length; m3 +=1) {
      occupied[sectD[m3]-1][sectP-1] = true;
    }
  }
  // console.log(occupied);

  return result;

}
//check the no. of pref professor inside a schedule
function profCheck(sc, criteria) {
  var profCount = 0;
  for(var n = 0; n < sc.length; n +=1) {
    for(var m = 0; m < criteria.courses.length; m +=1 ) {
      console.log('section is ' + JSON.stringify(sc[n]));
      console.log('criteria course m is ' + JSON.stringify(criteria.courses[m]));
      if(sc[n].courseId === criteria.courses[m].courseId && criteria.courses[m].preferedInstructors.indexOf(sc[n].professor) > -1) {
        profCount +=1;
        console.log('prof count ++');
      }
    }
  }
  return profCount;
}

//check the no. of friends overlap inside a schedule

function friendCheck(sc, user) {
  var frCount =0;

  for(var n = 0; n < user.friends.length; n +=1) {
    var fr = user.friends[n];
  //  console.log('friend ' + JSON.stringify(fr));
  console.log('friend =' + fr.assignedSchedule);
    for(var m =0; m < sc.length; m +=1) {
      //console.log('section ' + JSON.stringify(sc[m]));
      console.log('section id= ' + sc[m]._id);
      console.log('section id= ' + sc[m]._id.toString());
      console.log('index is ' + fr.assignedSchedule.indexOf(sc[m]._id.toString()));
      if(fr.assignedSchedule.indexOf(sc[m]._id.toString()) > -1) {
        console.log('inc frCount');
        frCount +=1;
      }
    }
  }
  console.log('fr count ' + frCount);
  return frCount;
}

exports.generateDesiredSchedule = function(req, res) {
//req = {user: user}
  var sectionChoices = [];
  var criteria = {};
  var school = {};
  var period =0;
  var day = 0;
  var currentSemester = '';
  var lunchStart, lunchEnd;
  var courses = [];
  var mostProfNum = -1;
  var mostFrNum = -1;
  //get user's school
  School.findOne({schoolName: req.body.user.school, $where: 'this.semester == this.currentSemester'},function(err1,sc){
    if(err1)
      console.log('generateDesireSchedule: error getting school');
    console.log('generateDesireSchedule:: Sent school back');
    school = sc;
    period = sc.periods;
    day = sc.days;
    currentSemester = sc.currentSemester;
    lunchStart = sc.lunchStartPeriod;
    lunchEnd = sc.lunchEndPeriod;


    // get criteria from user
    Criteria.findOne({user: req.body.user.username}, function(err2, cr){
      if(err2) console.log('genereteDesireSchedule: error getting criteria');
      criteria = cr;
      // console.log('generateDesiredSchedule: criteria is ' + JSON.stringify(criteria));
      // console.log('criteria.courses.length is ' + criteria.courses.length);


      //construct the sectionChoices layers with section from desired courses
      /* jshint ignore:start */

      for (i = 0; i < criteria.courses.length; i +=1) {
        var courseId = criteria.courses[i].courseId;
        console.log(courseId);
        Course.findOne({courseId: courseId, schoolName: school.schoolName ,semester: currentSemester}).populate('sections').exec( function(err3, c) {
          if(err3) console.log('error getting course');
          courses.push(c);
          // console.log('course + ' +JSON.stringify(c) );
        });
      }
      /* jshint ignore:end */
      setTimeout(function() {
        console.log('sections in courses is ' + JSON.stringify(courses));
        for (i = 0; i < courses.length; i +=1) {
          var eligibleSectionsForCourse = [];
          var excludedSectionsId = criteria.courses[i].excludedSections;
          // console.log('excludedSectionsId is ' + JSON.stringify(excludedSectionsId));

          //get the course
          var course = courses[i];
          // console.log('generateDesireSchedule: getting course ' + JSON.stringify(course));
          for(j = 0; j < course.sections.length; j +=1) {
            // console.log('this section id is ' + course.sections[j]._id );
            if(excludedSectionsId.indexOf(course.sections[j]._id) === -1) eligibleSectionsForCourse.push(course.sections[j]);
          }

          sectionChoices.push(eligibleSectionsForCourse);
        }
        // console.log('!!!!!!sectionChoices are ' + JSON.stringify(sectionChoices));
        for(i = 0; i < criteria.lunch.length; i +=1) {
          if(criteria.lunch[i]) {
            var lunchDayi = [];
            for(j = lunchStart;j <= lunchEnd;j+=1 ) {

              var lunchBlock = {
                _id: '',
                courseId: 'lunch day '+(i+1),
                scheduleBlock: {
                  period: j,
                  days: [i+1]
                  },
                professor: 'none',
                semester: 'none'
              };
              lunchDayi.push(lunchBlock);
            }
            sectionChoices.push(lunchDayi);
          }
        }

        // console.log('section choices is ' + JSON.stringify(sectionChoices));

        //finish constructing sectionChoices
        var result = [];
        allSchedule = [];
        acceptableSchedule = [];
        profOptimizedSchedule = [];
        friendOptimizedSchedule = {};
        //generate all schedule - combination of sections

        backtracking(sectionChoices, 0,result);
        // console.log('finished backtracking');
        //check for conflicts, get out the acceptable schedules and if no acceptable schedule avaiable then get out the one with least conflicts
        var smallestConflict = 10;
        var smallestConflictSchedule = {};
        var smallestConflictItems =[];
        console.log('allSchedule length is ' + allSchedule.length);
        // console.log('day is ' + day + ' period is ' + period);
        for(i = 0; i < allSchedule.length; i +=1) {
          //console.log('allSchedule iteration ' + i);

          var sc = allSchedule[i]; //sc should contain object of sections and lunch block section
          // console.log('iteration ' + i + ' schedule is ' + JSON.stringify(sc));
          var cnfMes = conflictCount(sc, day, period);
          console.log('conflict of iteration ' + i + ' is ' + cnfMes.conflict);

          //console.log('end count conflict iteration ' + i);
          if(cnfMes.conflict === 0) acceptableSchedule.push(sc);
          if(cnfMes.conflict < smallestConflict) {
            smallestConflict = cnfMes.conflict;
            smallestConflictSchedule = sc;
            smallestConflictItems = cnfMes.conflictItems;
          }
        }
        // console.log('acceptable schedules are ' + JSON.stringify(acceptableSchedule));
         console.log('acceptable schedules length is ' + acceptableSchedule.length);
        //optimize
        if(acceptableSchedule.length > 0) {
          mostProfNum = -1;
          // console.log('criteria is ' + JSON.stringify(criteria));
          for(i = 0; i  < acceptableSchedule.length; i +=1) {
            var sc1 = acceptableSchedule[i];
            var pCount = profCheck(sc1, criteria);
            console.log('prof iteration ' + i + ' prof count is ' + pCount);
            if(pCount > mostProfNum) {
              mostProfNum = pCount;
              profOptimizedSchedule = [];
              profOptimizedSchedule[0] = sc1;
            }
            else if(pCount === mostProfNum) profOptimizedSchedule.push(sc1);
          }
          // console.log('prof optimized schedules are ' + JSON.stringify(profOptimizedSchedule));
          // console.log('\n');
          console.log('prof optimized schedule length are ' + profOptimizedSchedule.length);

          mostFrNum = -1;
          // console.log('user is ' + JSON.stringify(req.body.user));
          for(i = 0; i <profOptimizedSchedule.length; i+=1) {
            var sc2 = profOptimizedSchedule[i];

            var frCount = friendCheck(sc2, req.body.user);
            if(frCount > mostFrNum) {
              mostFrNum =frCount;
              friendOptimizedSchedule = sc2;
            }


          }
          console.log('most fr num is ' + mostFrNum);
          console.log('fr optimized schedule ' + JSON.stringify(friendOptimizedSchedule));
        }

        var message = {
          status: '', schedule:{}, conflictItems: {}, prof:0 , friend: 0
        };
        var desiredSchedule = [];
        if(acceptableSchedule.length >0) {
          message.status = 'OK';
          message.schedule = friendOptimizedSchedule;
          for(var n =0; n < friendOptimizedSchedule.length; n +=1){
            if(friendOptimizedSchedule[n]._id !== '' && friendOptimizedSchedule[n]._id !== null){
              desiredSchedule.push(friendOptimizedSchedule[n]._id);
            }
          }
          message.conflictItems = {};
          message.prof = mostProfNum;
          message.friend = mostFrNum;
        }
        else {
          message.status = 'ERR';
          message.schedule = smallestConflictSchedule;
          for(var z =0; z < smallestConflictSchedule.length; z +=1){
            if(smallestConflictSchedule[z]._id !== '' && smallestConflictSchedule[z]._id !== null){
              desiredSchedule[z] = smallestConflictSchedule[z]._id;
            }
          }
          message.conflictItems = smallestConflictItems;
          message.prof= 0;
          message.friend = 0;
        }

        /* jshint ignore:start */
        console.log('username='+req.body.user.username);
        console.log('desired schedule === '+ desiredSchedule);
        User.update({username: req.body.user.username}, {desiredSchedule: desiredSchedule}, function(err, res4){
          if(err)
            console.log('Error saving desired schedule');
          res.json(message);
        });
        /* jshint ignore:end */
      },1000);
    });
  });
};
