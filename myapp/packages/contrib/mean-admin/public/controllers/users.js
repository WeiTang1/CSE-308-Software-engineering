'use strict';

angular.module('mean.mean-admin').controller('UsersController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', 'Users',
    function($scope, Global, Menus, $rootScope, $http, Users) {
        $scope.global = Global;
        $scope.userSchema = [{
            title: 'Email',
            schemaKey: 'email',
            type: 'text',
            inTable: true
        }, {
            title: 'First Name',
            schemaKey: 'firstName',
            type: 'text',
            inTable: true
        }, {
            title: 'Last Name',
            schemaKey: 'lastName',
            type: 'text',
            inTable: true
        }, {
            title: 'Username',
            schemaKey: 'username',
            type: 'text',
            inTable: true
        }, {
            title: 'Roles',
            schemaKey: 'roles',
            type: 'select',
            options: ['authenticated', 'pending'],
            inTable: true
        }, {
            title: 'Password',
            schemaKey: 'password',
            type: 'password',
            inTable: false
        }, {
            title: 'Repeat password',
            schemaKey: 'confirmPassword',
            type: 'password',
            inTable: false
        }, {
            title: 'Schools',
            schemaKey: 'school',
            type: 'text',
            inTable: true
        }];
        $scope.user = {};

        $scope.init = function() {
            Users.query({}, function(users) {
                $scope.users = users;
            });
        };

        $scope.add = function() {
            if (!$scope.users) $scope.users = [];

            var user = new Users({
                email: $scope.user.email,
                name: $scope.user.name,
                username: $scope.user.username,
                password: $scope.user.password,
                confirmPassword: $scope.user.confirmPassword,
                roles: $scope.user.roles
            });

            user.$save(function(response) {
                $scope.users.push(response);
            });

            this.firstName = this.lastName = this.email = this.password = this.role = '';
        };

        $scope.remove = function(user) {
            for (var i in $scope.users) {
                if ($scope.users[i] === user) {
                    $scope.users.splice(i, 1);
                }
            }

            user.$remove();
        };

        $scope.approveAll = function(){
          console.log('Code was here');
          $http.get('/admin/approveAll')
          .success(
            function(data){
              console.log('Successfully approved all');
              $scope.init();
              // window.location.reload();
            }
          ).error(function(data){
            console.log('Unsuccessful approve all');
          });
        };

        $scope.update = function(user, userField) {
            if (userField && userField === 'roles'
                && user.roles.indexOf('admin') === -1) {
                    user.$update();
                    if(user.roles.indexOf('pending')===-1){
                        $http.get('/admin/users/account-approve', {
                          params:{
                            text: user.email
                          }
                        })
                          .success(function(doc) {
                          })
                          .error(function(doc) {
                          });

                    }else{
                    }
            } else
                user.$update();

        };

        $scope.beforeSelect = function(userField, user) {
            if (userField === 'roles') {
                user.tmpRoles = user.roles;
            }
        };
    }
]);
