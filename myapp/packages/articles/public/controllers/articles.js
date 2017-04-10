'use strict';



angular.module('mean.articles').factory('friendsService',['$http',function($http){

  var friendsFactory = {};
  friendsFactory.getFriendRequestsByRequestee = function(requesteeId){
    return $http.post('/user/getFriendRequestsByRequestee',
    {requestee: requesteeId});
  };

  friendsFactory.getFriendRequestsByRequester = function(requesterId){
    return $http.post('/user/getFriendRequestsByRequester',
    {requester: requesterId});
  };

  friendsFactory.getFriends = function(uname){
    return $http.get('/user/friends',{
      params: {username:  uname}
    });
  };

  return friendsFactory;
}]);

angular.module('mean.articles').factory('generatorService',['$http',function($http){
  var desiredSchedule = [];
  //var acceptableSchedules = [];//= [[sec1,sec2...],[sec2,sec5...],...]
  var genFactory = {};
  var coursesFromUserSchool = [];
  var criteriaCourses = [];

  genFactory.generateDesiredSchedule = function(user){
    console.log('Generating desired schedule');
    for(var i=0;i<user.criteria.courses.length;i+=1){
      criteriaCourses.push(user.criteria.courses[i].courseId);
    }

    generateAcceptableSchedule(user);

    // makeComboSectionsAndKeepNoConflictLunch();
    return desiredSchedule;
  };

  function generateAcceptableSchedule(user){
    $http.post('/user/courses',{school: user.school}
    )
    .success(function(courses){
      console.log('Successfully got courses from user school.');

      //remove courses user does not want
      coursesFromUserSchool = courses;
      for(var i=coursesFromUserSchool.length-1;i>=0;i-=1){
        if(criteriaCourses.indexOf(coursesFromUserSchool[i].courseId) < 0){
          //remove that element from coursesFromUserSchool
          coursesFromUserSchool.splice(i,1);
        }
      }
      console.log(coursesFromUserSchool);
      //remove courses user does not want

      //remove sections user does not want
      removeExcludedSections(coursesFromUserSchool,user.criteria);
      //remove sections user does not want
    })
    .error(function(err){
      console.log('Error getting courses from user school');
    });
  }

  function removeExcludedSections(courses, criteria){
    //loop through courses
    for(var i=0;i<courses.length;i+=1){
      //loop through criteria courses
      for(var j=0;j<criteria.courses.length;j+=1){
        //find those courses whose id match
        if(criteria.courses[j].courseId === courses[i].courseId){
          //loop through sections of courses and test if any of them are in excluded sections
          var excludedSectionsOfThisCourse = [];
          //push section ids to temp array
          for(var l=0;l < criteria.courses[j].excludedSections.length;l+=1){
            excludedSectionsOfThisCourse.push(criteria.courses[j].excludedSections[l]._id);
          }
          for(var k=courses[i].sections.length-1;k >=0;k-=1){
            //if true then remove section from course
            if(excludedSectionsOfThisCourse.indexOf(courses[i].sections[k]._id) > -1){
              courses[i].sections.splice(k,1);
            }
          }//end k
        }
      }//end j
    }//end i
    console.log(courses);
  }




  return genFactory;
}]);

//testing drag
angular.module('mean.articles')
.directive('draggable', function($document) {
    return function(scope, element, attr) {
      var startX = 0, startY = 0, x = 0, y = 0;
      element.css({
       position: 'relative',
       border: '1px solid red',
       backgroundColor: 'lightgrey',
       cursor: 'pointer',
       display: 'block',
       width: '65px'
      });
      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.screenX - x;
        startY = event.screenY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.screenY - startY;
        x = event.screenX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  });

angular.module('mean.articles').factory('userService',['$http',function($http){
  var userFactory = {};
  userFactory.retrieveCurrentUserInfo = function(userEmail){
    return $http.get('/user/currentUser',
    {
      params: {email: userEmail}
    });
  };

  return userFactory;
}]);

angular.module('mean.articles')
.controller('SchoolController',['$scope','$http',function($scope,$http){

  $scope.errorAddSchool = '';

  $scope.addSchool = function(){
    $http.post('/addSchool',{//server side /addschool
      schoolName: $scope.schoolName.toLowerCase(),
      semester: $scope.semester.toLowerCase(),
      currentSemester: $scope.currentSemester.toLowerCase(),
      periods: parseInt($scope.periods),
      days: parseInt($scope.days),
      lunchStartPeriod:parseInt($scope.lunchStartPeriod),
      lunchEndPeriod:parseInt($scope.lunchEndPeriod)
    }).success(function(data){
      window.alert('School ' + $scope.schoolName + ' added!');
      $scope.addSchoolForm.$setPristine();
      $scope.errorAddSchool = null;
      $scope.schoolName = null;
      $scope.semester = null;
      $scope.currentSemester = null;
      $scope.periods = null;
      $scope.days = null;
      $scope.lunchStartPeriod=null;
      $scope.lunchEndPeriod=null;
    }).error(function(err){
      console.log('Error adding School');
      $scope.errorAddSchool = 'Error: Periods = [6,12] Days = [1,7]';
    });
  };

}])
.controller('FriendsController',['$scope','$http','$resource','$rootScope','Global','friendsService',function($scope,$http,$resource,$rootScope,Global,friendsService){


  $scope.global = Global;
  console.log('globalusername'+$scope.global.user.username);

  // function getFriends(){
  //   $http.get('/user/friends',{
  //     params: {username:  $scope.global.user.username}
  //   }).success(function(data){
  //     if(data){
  //       console.log('Successfully retrieved friends!');
  //     $scope.friends = data.friends;
  //     console.log(data.friends);
  //     }
  //   })
  //   .error(function(data){
  //     console.log('Error' + data);//data[0]
  //   });
  // }
  function getFriends(){
  friendsService.getFriends($scope.global.user.username)
  .success(function(data){
    if(data){
      console.log('Successfully retrieved friends!');
    $scope.friends = data.friends;
    console.log(data.friends);
    }
  })
  .error(function(data){
    console.log('Error' + data);//data[0]
  });
}

getFriends();
  $scope.remove = function(friend){
    $http.delete('/user/removeFriend',{
      params: {
        userId:  $scope.global.user._id,
        friendId: friend._id
        }
    }).success(function(data){
      console.log('successfully deleted friend');
      getFriends();
      // friendsService.getFriends($scope.global.user.username)
      // .success(function(data){
      //   if(data){
      //     console.log('Successfully retrieved friends!');
      //   $scope.friends = data.friends;
      //   console.log(data.friends);
      //   }
      // })
      // .error(function(data){
      //   console.log('Error' + data);//data[0]
      // });
      // window.location.reload();
    }).error(function(data){
      console.log('Error'+data);
    });

  };

}])
.controller('FriendRequestsController',['$scope','$http','Global','friendsService',function($scope,$http,Global,friendsService){
  $scope.global = Global;

  friendsService.getFriendRequestsByRequestee($scope.global.user._id)
  .success(function(data){
    $scope.friendRequests = data;
    console.log(data);
  }).error(function(data){

  });

  $scope.acceptFriendRequest = function(requester){
    $http.post('/user/acceptFriendRequest',{
      requester:  requester._id,
      requestee: $scope.global.user._id
    })
    .success(function(data){
      console.log('Successfully accepted friend request');
      friendsService.getFriendRequestsByRequestee($scope.global.user._id)
      .success(function(data){
        $scope.friendRequests = data;
        console.log(data);
      }).error(function(data){

      });
    }).error(function(data){
      console.log('Unsuccessfully accepted friend request.');
    });
  };

  $scope.declineFriendRequest = function(requester){
      $http.post('/user/declineFriendRequest',{
        requester: requester._id,
        requestee: $scope.global.user._id
      }).success(function(data){
          console.log('Successful decline friend request');
          friendsService.getFriendRequestsByRequestee($scope.global.user._id)
          .success(function(data){
            $scope.friendRequests = data;
            console.log(data);
          }).error(function(data){

          });
        }).error(function(data){
          console.log('Unsuccessful decline friend request');
        });
  };

}])
.controller('searchStudents',['$scope','$http','Global','friendsService',function($scope,$http,Global,friendsService){
  $scope.global = Global;
  $scope.foundUsers = {};
  $scope.friendRequests = {};
  $scope.areFriends = function(friend){
    console.log('Calling areFriends on '+friend.username);
    return (friend.friends.indexOf($scope.global.user._id)  >= 0);
  };
  $scope.requestSentTo = function(requestee){
      for(var i = 0;i < $scope.friendRequests.length;i+=1){
        if($scope.friendRequests[i].requestee.username === requestee.username)
          return true;
      }
      return false;
  };

  $scope.findByFirstLastName = function(firstName, lastName){
    //get friendRequests that have requester=current username
    friendsService.getFriendRequestsByRequester($scope.global.user._id)
    .success(function(data){
      $scope.friendRequests = data;
    })
    .error(function(data){

    });
    //get users containing first and last name specified
    $http.post('/user/findByFirstLastName',{
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase()
    }).success(function(data){
      console.log('Successfully search by f,l name '+ data);
      $scope.foundUsers = data;
    }).error(function(data){
      console.log('Error when searching by f,l name');
    });
  };

  $scope.addFriend = function(friend){

    $http.post('/user/addFriend',{
      requester:  $scope.global.user._id,
      requestee: friend._id
    })
    .success(function(data){
      console.log('Successfully send friend request');
      friendsService.getFriendRequestsByRequester($scope.global.user._id)
      .success(function(data){
        $scope.friendRequests = data;
      })
      .error(function(data){

      });
    }).error(function(data){
      console.log('Unsuccessful send friend request.');
    });
  };



}])
.controller('assignedScheduleCtrl',['$scope','$http','Global','$rootScope','friendsService','userService',function($scope,$http,Global,$rootScope,friendsService,userService){
  $scope.global = Global;
  $scope.currentSemester = null;
  //get current semester



  function refreshUser(){
    userService.retrieveCurrentUserInfo($scope.global.user.email)
    .success(function(data){
      console.log('Successfully refreshed user');
      $scope.global.user=data;
      $scope.user = data;
      $scope.currentStudentAssignedSchedule = $scope.user.assignedSchedule;
      $scope.currentStudentDesiredSchedule = $scope.user.desiredSchedule;
      $http.post('/school/currentSemester',{
        schoolName: $scope.user.school
      })
      .success(function(school){
        console.log('Successfully got current semester');
        $scope.currentSemester = school.currentSemester;
      })
      .error(function(err){
        console.log(err);
      });
    })
    .error(function(err){
      console.log(err);
    });
  }
  /*global saveAs */
  $scope.exportAssignedSchedule = function () {
        var blob = new Blob([document.getElementById('assignedSchedule').innerHTML], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
        });
        saveAs(blob, $scope.user.username+'AssignedSchedule.xls');
    };

    $scope.exportDesiredSchedule = function () {
          var blob = new Blob([document.getElementById('desiredSchedule').innerHTML], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
          });
          saveAs(blob, $scope.user.username+'DesiredSchedule.xls');
      };


    $scope.exportAssignedScheduleWithFriends = function () {
      var blob = new Blob([document.getElementById('assignedScheduleWithFriends').innerHTML], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
      });
      saveAs(blob, $scope.user.username+'AssignedScheduleWithFriends.xls');
    };

    $scope.exportDesiredScheduleWithFriends = function () {
      var blob = new Blob([document.getElementById('desiredScheduleWithFriends').innerHTML], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
      });
      saveAs(blob, $scope.user.username+'DesiredScheduleWithFriends.xls');
    };


  refreshUser();

  $scope.school = {};
  var periods = [];
  var days = [];
  $scope.searchResult = {};
  $scope.showSection = false;
  $scope.currentStudentAssignedSchedule = $scope.global.user.assignedSchedule;
  $scope.showAddSection = function(){
    $scope.showSection = true;
  };

  $scope.isEmpty = function(obj){
    return angular.equals({},$scope.searchResult);
  };

  $scope.removeSectionFromAssignedSchedule = function(section){
    $http.post('/user/removeFromAssignedSchedule',{
      email: $scope.user.email,
      section_id: section._id
    })
    .success(function(data){
      console.log('Successfully removed section from assigned schedule');
      refreshUser();
    })
    .error(function(err){
      console.log('Unsuccessful remove of section from assigned schedule');
    });
  };

  //get current user's school
    $http.post('/getSchool',{schoolName: $scope.global.user.school})
    .success(function(data){
      console.log('Retrieved school'+data);
      if(data !== null){
      $scope.school = data;

      for(var i=0;i<$scope.school.periods;i+=1) {
        periods.push(i+1);
      }
      $scope.periods = periods;
      for(var j=0;j<$scope.school.days;j+=1) {
        days.push(j+1);
      }
      $scope.days = days;
      }
    })
    .error(function(data){
      console.log('error retrieving school');
    });

  //First create a course with empty sections array
  $scope.addCourse = function(){
    console.log('period selected = ' + $scope.periodSelected);
    console.log('days selected = ' + $scope.daysSelected[0]);

      $http.post('/addCourse',{//server side /addcourse
        courseId: $scope.courseId.toLowerCase(),
        courseName: $scope.courseName,
        schoolName: $scope.global.user.school,
        semester: $scope.semester.toLowerCase()
      }).success(function(course){
        //add section to the course
        console.log('course='+course);

        // console.log('Succeessfully added course. Now adding section to course...');

        $http.post('/addSection',{
          course_id: course._id,
          courseId: course.courseId,
          courseName: $scope.courseName,
          school: $scope.global.user.school,
          semester: $scope.semester,
          professor: $scope.professor,
          scheduleBlock: {period: $scope.periodSelected, days: $scope.daysSelected}
        })
        .success(function(doc){
          console.log('Successfully added section to course');
          //add section to user assigned schedule
          $http.post('/addSectionToAssignedSchedule',{
            username: $scope.global.user.username,
            sectionId: doc._id
          })
          .success(function(data){
            console.log('Successfully added section to assigned schedule==='+data);
            refreshUser();
            // globalUser.refreshUserInfo(globalUser.user.email);
            // $scope.globalUser = globalUser.user;
          })
          .error(function(err){
            console.log('Unsuccessfully added section to assigned schedule');
          });
        })
        .error(function(err){
          console.log('Unsuccessfully added section to course');
        });
      })
      .error(function(doc){
        console.log('Unsuccessful add course');
      });
  };

  $scope.showFriendsInSection = function(section){
    var friendsInSchedule = [];
    for(var i=0;i < $scope.user.friends.length;i+=1){
      if($scope.user.friends[i].assignedSchedule.indexOf(section._id) > -1){
        friendsInSchedule.push($scope.user.friends[i].username);
      }
    }
    alert('Friends in section: '+friendsInSchedule);
  };

  $scope.friendsInSection = function(section){
    var friendsInSection = [];
    for(var i=0;i < $scope.user.friends.length;i+=1){
      if($scope.user.friends[i].assignedSchedule.indexOf(section._id) > -1){
        friendsInSection.push($scope.user.friends[i].username);
      }
    }
    return friendsInSection;
  };

  //CREATE ADD SECTION. searchResult is a course object
  $scope.addSectionToCourse = function(searchResult){
    $http.post('/addSectionToCourse',{
      course_id: searchResult._id,
      courseId: searchResult.courseId,
      courseName: searchResult.courseName,
      school: searchResult.schoolName,
      semester: searchResult.semester,
      professor: $scope.section.professor,
      scheduleBlock:{period: $scope.section.periodSelected, days: $scope.section.daysSelected}
    })
    .success(function(data){
      console.log('Successfully added section to course');
      $scope.showSection = false;

    }).error(function(err){
      console.log('Error adding section to course');
    });
  };

  $scope.searchForCourse = function(){
    $scope.courseName = '';
    $scope.professor = '';

    $http.post('/searchForCourse',{
      courseId: $scope.search.courseId.toLowerCase(),
      semester: $scope.currentSemester.toLowerCase(),
      schoolName: $scope.global.user.school.toLowerCase()
    })
    .success(function(course){
      console.log('Successfully retrieved course.'+ course);
      if(course !== null){
      $scope.courseId = course.courseId;
      $scope.courseName = course.courseName;
    }else{
      $scope.courseId = $scope.search.courseId;
      $scope.courseAdded = false;
    }
      $scope.semester = $scope.currentSemester;
      $scope.searchResult = course;

    })
    .error(function(err){
      console.log('Error retrieving course');
    });
  };

  $scope.addSectionToAssignedSchedule = function(){
    $http.post('/addSectionToAssignedSchedule',{
      username: $scope.global.user.username,
      sectionId: $scope.sectionSelected._id
    })
    .success(function(data){
      console.log(data);
      alert(data);
      refreshUser();
      //getSections();
      // globalUser.refreshUserInfo(globalUser.user.email);
      // $scope.globalUser = globalUser.user;
    })
    .error(function(err){
      console.log('Unsuccessfully added section to assigned schedule');
    });
  };

}])
.controller('courseCtrl', ['$scope', '$http','Global', 'Articles',
function($scope,$http, Global, Articles) {

  $scope.global = Global;

  $http.post('/getCoursesOffering', {
    school: $scope.global.user.school
  }).success(function(sections){
    $scope.coursesOffering = sections;
  }).error(function(err){
    console.log(err);
  });

}])
.controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Global', 'Articles',
  function($scope, $stateParams, $location, Global, Articles) {
    $scope.global = Global;
    $scope.hasAuthorization = function(article) {
      if (!article || !article.user) return false;
      return $scope.global.isAdmin || article.user._id === $scope.global.user._id;
    };

    $scope.create = function(isValid) {
      if (isValid) {
        var article = new Articles({
          title: this.title,
          content: this.content
        });
        article.$save(function(response) {
          $location.path('articles/' + response._id);
        });

        this.title = '';
        this.content = '';
      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(article) {
      if (article) {
        article.$remove(function(response) {
          for (var i in $scope.articles) {
            if ($scope.articles[i] === article) {
	      $scope.articles.splice(i,1);
            }
          }
          $location.path('articles');
        });
      } else {
        $scope.article.$remove(function(response) {
          $location.path('articles');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        var article = $scope.article;
        if(!article.updated) {
          article.updated = [];
	}
        article.updated.push(new Date().getTime());

        article.$update(function() {
          $location.path('articles/' + article._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.find = function() {
      Articles.query(function(articles) {
        $scope.articles = articles;
      });
    };

    $scope.findOne = function() {
      Articles.get({
        articleId: $stateParams.articleId
      }, function(article) {
        $scope.article = article;
      });
    };
  }
])
.controller('PreferenceCtrl',['$scope','$http','Global','$rootScope','userService','generatorService',function($scope,$http,Global,$rootScope, userService,generatorService){
  $scope.global = Global;
  $scope.criteria = {};
  $scope.school = {};
  $scope.currentSemester = {};
  $scope.excludedSections = [];
    //refresh user
  $scope.refreshUser = function(){
    userService.retrieveCurrentUserInfo($scope.global.user.email)
    .success(function(data){
      console.log('Successfully refreshed user');
      $scope.global.user=data;
      $scope.user = data;
      $scope.currentStudentAssignedSchedule = $scope.user.assignedSchedule;
      console.log(JSON.stringify($scope.user));
    })
    .error(function(err){
      console.log(err);
    });
    //get user's school
    $http.post('/getSchool',{schoolName: $scope.global.user.school})
    .success(function(data){
      console.log('Retrieved school ');
      if(data !== null){
        $scope.school = data;
        $scope.currentSemester = $scope.school.currentSemester;

      }
    })
    .error(function(data){
      console.log('error retrieving school');
    });

    //get criteria
    $http.post('/getCriteria',{
      username: $scope.global.user.username,
    })
    .success(function(criteria){
      console.log('Successfully retrieved criteria '+ JSON.stringify(criteria));
      $scope.criteria = criteria;

      $scope.lunch = [];
      if($scope.criteria !== null){
        for(var i = 0; i < $scope.school.days;i +=1) {
          if($scope.criteria.lunch !== null && $scope.criteria.lunch.length >0){
            $scope.lunch[i] = $scope.criteria.lunch[i];
          }else{
            $scope.lunch[i] = false;
          }
        }
      }else{
        for(var j=0;j<$scope.school.days;j+=1){
          $scope.lunch[j] = false;
        }
      }
    })
    .error(function(err){
      console.log('Error retrieving criteria');
    });
  };

    $scope.generateDesiredSchedule = function(){
      $http.post('/generateDesiredSchedule', {
        user: $scope.user
      }).success(function(data) {
        console.log('successfully receive message');
        console.log(JSON.stringify(data));
        if(data.status === 'OK' ) {
          window.alert('Desired schedule generated. \nTo see your desired schedule, go to Desired Schedule page');

        }
        else if(data.status === 'ERR') {
          var str = 'Can not generate schedule from your preferences.\n You might want to omit these conditions: '+ data.conflictItems;
          window.alert(str);
        }
      }).error(function(err) {
        console.log('Error generating desired schedule');
      });

    };





    console.log($scope.lunch);

  $scope.searchForCourse = function() {

    console.log('current semester is ' + $scope.currentSemester);
    if($scope.criteria !== null){
    for(var j = 0; j < $scope.criteria.courses.length; j +=1) {
      if($scope.criteria.courses[j].courseId === $scope.search.courseId.toLowerCase()) {
        window.alert('This course has already been in the list!');
        return;
      }
    }
  }
    $http.post('/searchForCourse',{
      courseId: $scope.search.courseId.toLowerCase(),
      semester: $scope.currentSemester.toLowerCase(),
      schoolName: $scope.school.schoolName.toLowerCase()
    })
    .success(function(course){
      console.log('Successfully retrieved course.'+ course);
      $scope.searchResult = course;
      // console.log(JSON.stringify(course));
      // console.log('course name is ' + course.courseName);
    })
    .error(function(err){
      console.log('Error retrieving course');
    });
  };

  $scope.addToCriteria = function() {
    $scope.excludedSections = [];
    $scope.preferedInstructors = [];

    for(var i = 0; i< $scope.searchResult.sections.length; i +=1) {

      if($scope.searchResult.sections[i].selected) {
        console.log($scope.searchResult.sections[i]);
        $scope.excludedSections.push($scope.searchResult.sections[i]._id);
      }
      if($scope.searchResult.sections[i].preferedInstructor && $scope.preferedInstructors.indexOf($scope.searchResult.sections[i].professor) === -1)
      {
        console.log('prefered instructor ' + $scope.searchResult.sections[i].professor);
        $scope.preferedInstructors.push($scope.searchResult.sections[i].professor);
      }
    }


    console.log('excluded sections ' + JSON.stringify($scope.excludedSections));
    console.log('lunch ' + $scope.lunch);
    $http.post('/addToCriteria', {
      username: $scope.global.user.username,
      courseId: $scope.searchResult.courseId,
      preferedInstructors: $scope.preferedInstructors,
      excludedSections: $scope.excludedSections,
      lunch: $scope.lunch
    })
    .success(function(course){
      console.log('Successfully add into criteria');
      //window.location.reload();
      $scope.refreshUser();


    })
    .error(function(err){
      console.log('Error adding to criteria');
    });



  };

  $scope.removeCourseFromCriteria = function(course) {
    $http.post('/removeCourseFromCriteria', {
      user: $scope.global.user.username,
      course: course.courseId
    })
    .success(function() {
      console.log('Successfully delete course from criteria');
      $scope.refreshUser();
      // window.location.reload();
    })
    .error(function(err) {
      console.log('Error delete course from criteria');
    });
  };
  $scope.updateLunch = function() {
    $http.post('/updateLunch', {
      user: $scope.global.user.username,
      lunch: $scope.lunch
    }).success(function(){
      $scope.refreshUser();

    }).error(function(err){
      console.log('error update lunch');
    });
  };
  }
])
;
