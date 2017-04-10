'use strict';

var mean = require('meanio');

exports.render = function(req, res) {

  var modules = [];
  // Preparing angular modules list with dependencies
  for (var name in mean.modules) {
    modules.push({
      name: name,
      module: 'mean.' + name,
      angularDependencies: mean.modules[name].angularDependencies
    });
  }

  function isAdmin() {
    return req.user && req.user.roles.indexOf('admin') !== -1;
  }

  // Send some basic starting info to the view
  res.render('index', {
    user: req.user ? {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      assignedSchedule: req.user.assignedSchedule,
      desiredSchedule: req.user.desiredSchedule,
      friends: req.user.friends,
      _id: req.user._id,
      username: req.user.username,
      profile: req.user.profile,
      school: req.user.school,
      roles: req.user.roles
    } : {},
    modules: modules,
    isAdmin: isAdmin,
    adminEnabled: isAdmin() && mean.moduleEnabled('mean-admin')
  });
};
