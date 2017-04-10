'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    School = mongoose.model('School'),
    _ = require('lodash');

/**
 * Create school
 */
exports.create = function(req, res, next) {
    var school = new School(req.body);



    // because we set our school.provider to local our models/school.js validation will always be true
    // req.assert('email', 'You must enter a valid email address').isEmail();
    // req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    // req.assert('schoolname', 'schoolname cannot be more than 20 characters').len(1, 20);
    // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    // var errors = req.validationErrors();
    // console.log(errors);
    // if (errors) {
    //     return res.status(400).send(errors);
    // }

    // Hard coded for now. Will address this with the school permissions system in v0.3.5
    //school.roles = ['authenticated'];
    school.roles = req.body.roles;
    school.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    res.status(400).send('schoolname already taken');
                    break;
                default:
                    res.status(400).send('Please fill all the required fields');
            }

            return res.status(400);
        }
        res.jsonp(school);
    });
};

/**
 * Find school by id
 */
exports.school = function(req, res, next, id) {
    school
        .findOne({
            _id: id
        })
        .exec(function(err, school) {
            if (err) return next(err);
            if (!school) return next(new Error('Failed to load school ' + id));
            req.profile = school;
            next();
        });
};
/**
 * Update a school
 */
exports.update = function(req, res) {
    var school = req.profile;
    school = _.extend(school, req.body);

    school.save(function(err) {
        res.jsonp(school);
    });
};

/**
 * Delete an school
 */
exports.destroy = function(req, res) {
    var school = req.profile;

    school.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {        
            res.jsonp(school);
        }
    });
};

/**
 * List of schools
 */
exports.all = function(req, res) {
    School.find().sort('-created').populate('school').exec(function(err, schools) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(schools);
        }
    });
};
