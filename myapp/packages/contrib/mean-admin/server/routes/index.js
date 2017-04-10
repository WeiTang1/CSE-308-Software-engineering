'use strict';
var Grid = require('gridfs-stream');
var mongoose = require('mongoose'),
    School = mongoose.model('School'),
    User = mongoose.model('User');

// The Package is past automatically as first parameter
module.exports = function(Admin, app, auth, database) {
    var gfs = new Grid(database.connection.connections[0].db, database.connection.mongo);
    var mean = require('meanio');

    //Setting up the users api
    var users = require('../controllers/users');
    app.get('/admin/users', auth.requiresAdmin, users.all);
    app.post('/admin/users', auth.requiresAdmin, users.create);
    app.put('/admin/users/:userId', auth.requiresAdmin, users.update);
    app.delete('/admin/users/:userId', auth.requiresAdmin, users.destroy);
    app.get('/admin/approveAll',function(req,res){
      console.log('Code was here 2');
      User.update({'roles.0': 'pending'},{$set:{'roles.0': 'authenticated'}},{multi:true},
        function(err, doc){
          if (err)
            console.log('error approve all');
            res.send(200);
        });
    });

    var schools = require('../controllers/schools');
    app.get('/admin/schools', auth.requiresAdmin, schools.all);
    app.put('/admin/schools/:schoolId', auth.requiresAdmin, schools.update);
    app.get('/admin/updateSchool', function(req,res){
      var id = mongoose.Types.ObjectId(req.query.schoolId);
      console.log('!!!!!!!!!!' + id + ' ' + req.query.schoolId + req.query.schoolName);
      School.update({_id: id},
      {schoolName: req.query.schoolName, semester: req.query.semester,currentSemester: req.query.currentSemester, periods: req.query.periods, days: req.query.days,lunchStartPeriod:req.query.lunchStartPeriod,
      lunchEndPeriod:req.query.lunchEndPeriod},
      function(err,doc){
          if(err)
            res.send(err);
          res.json(doc);
      });
    });
    app.delete('/admin/removeSchool', function(req, res){
      School.find({
        schoolName: req.query.schoolName,
        semester: req.query.semester
      }).remove(function(err, doc){
        if (err)
          res.send(err);
        res.json(doc);
      });
    });

    //Setting up the users api
    var themes = require('../controllers/themes');
    app.get('/admin/themes', auth.requiresAdmin, function(req, res) {
        themes.save(req, res, gfs);
    });
    app.get('/admin/themes/defaultTheme', auth.requiresAdmin, function(req, res) {
        themes.defaultTheme(req, res, gfs);
    });

    app.get('/admin/themes/defaultTheme', auth.requiresAdmin, function(req, res) {
        themes.defaultTheme(req, res, gfs);
    });
    app.get('/admin/modules', auth.requiresAdmin, function(req, res) {
        var modules = {};
        for (var name in mean.modules)
            modules[name] = mean.modules[name];
        res.jsonp(modules);
    });

    var settings = require('../controllers/settings');
    app.get('/admin/settings', auth.requiresAdmin, settings.get);
    app.put('/admin/settings', auth.requiresAdmin, settings.save);
    app.get('/admin/users/account-approve',function(req,res){
      users.sendapproveemail(req.query.text);
    });

};
