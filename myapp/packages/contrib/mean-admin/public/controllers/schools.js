'use strict';

angular.module('mean.mean-admin').controller('SchoolsController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', 'Schools',
    function($scope, Global, Menus, $rootScope, $http, Schools) {
        $scope.global = Global;
        $scope.schoolSchema = [{
            title: 'School Name',
            schemaKey: 'schoolName',
            type: 'text',
            inTable: true
        }, {
            title: 'Semester',
            schemaKey: 'semester',
            type: 'text',
            inTable: true
        },{
          title: 'Current Semester',
          schemaKey: 'currentSemester',
          type: 'text',
          inTable: true
        },{
            title: "Period",
            schemaKey: 'periods',
            type: 'text',
            inTable: true
        }, {
            title: 'Days',
            schemaKey: 'days',
            type: 'text',
            inTable: true
        }, {
            title: 'Lunch Start Period',
            schemaKey: 'lunchStartPeriod',
            type: 'text',
            inTable: true
        }, {
            title: 'Lunch End Period',
            schemaKey: 'lunchEndPeriod',
            type: 'text',
            inTable: true
        }];
        $scope.school = {};

        $scope.init = function() {
            Schools.query({}, function(schools) {
                $scope.schools = schools;
            });
        };

        $scope.remove = function(school){
            $http.delete('/admin/removeSchool', {
            params:{
              schoolName: school.schoolName,
              semester: school.semester
            }
          }).success(function(data){
            console.log('Successfully deleted');
            $scope.init();
            // window.location.reload();
          }).error(function(data){
            console.log('Error removing school');
          });

        };
        // $scope.remove = function(school) {
        //     for (var i in $scope.schools) {
        //         if ($scope.schools[i] === school) {
        //             $scope.schools.splice(i, 1);
        //         }
        //     }
        //
        //     school.$remove();
        // };
//$scope.update = function(school, schoolField) {
        $scope.update = function(school, schoolField) {
          console.log(school+schoolField);
                //school.$update();
                console.log('schoolname='+school.schoolName);
                $http.get('/admin/updateSchool',{
                  params:{
                  schoolName: school.schoolName,
                  semester: school.semester,
                  currentSemester: school.currentSemester,
                  periods: school.periods,
                  days: school.days,
                  schoolId: school._id,
                  lunchStartPeriod:school.lunchStartPeriod,
                  lunchEndPeriod:school.lunchEndPeriod
                }
                }).success(
                  function(data){
                    console.log('Successfully updated');
                  }
                ).error(function(data){
                  console.log('Unsuccessful update');
                });
        };

        // $scope.beforeSelect = function(schoolField, school) {
        //     if (schoolFiled === 'roles') {
        //         schoold.tmpRoles = user.roles;
        //     }
        // };
    }
]);
