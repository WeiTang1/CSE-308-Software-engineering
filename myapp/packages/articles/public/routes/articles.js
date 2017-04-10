'use strict';

//Setting up route
angular.module('mean.articles').config(['$stateProvider',
  function($stateProvider) {
    // Check if the user is connected
    var checkLoggedin = function($q, $timeout, $http, $location) {
      // Initialize a new promise
      var deferred = $q.defer();

      // Make an AJAX call to check if the user is logged in
      $http.get('/loggedin').success(function(user) {
        // Authenticated
        if (user !== '0') $timeout(deferred.resolve);

        // Not Authenticated
        else {
          $timeout(deferred.reject);
          $location.url('/login');
        }
      });

      return deferred.promise;
    };

    // states for my app
    $stateProvider
      .state('all articles', {
        url: '/articles',
        templateUrl: 'articles/views/list.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('Assigned Schedule', {
        url: '/articles/assignedSchedule',
        templateUrl: 'articles/views/assignedSchedule.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('edit article', {
        url: '/articles/:articleId/edit',
        templateUrl: 'articles/views/edit.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('article by id', {
        url: '/articles/:articleId',
        templateUrl: 'articles/views/view.html',
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .state('Add School',{
        url: '/articles/addSchool',
        templateUrl: 'articles/views/addSchool.html'
      })
      .state('Search Students',{
        url: '/articles/searchStudents',
        templateUrl: 'articles/views/searchStudents.html'
      })
      .state('Friends',{
        url: '/articles/friends',
        templateUrl: 'articles/views/friends.html'
      })
      .state('Schedules',{
        url: '/articles/schedules',
        templateUrl: 'articles/views/schedules.html'
      })
      .state('View Course Offering', {
        url: '/articles/viewcourseoffering',
        templateUrl: 'articles/views/viewcourseoffering.html',
        resolve: {
          loggedin: checkLoggedin
        }
       })
       .state('Friend Requests',{
         url: '/articles/friendRequests',
         templateUrl: 'articles/views/friendRequests.html'
       })
       .state('Course Schedule',{
         url: '/articles/courseSchedules',
         templateUrl: 'articles/views/courseSchedules.html'
       })
       .state('Preferences',{
         url: '/articles/Preferences',
         templateUrl: 'articles/views/criteria.html'
       });

     }]);
