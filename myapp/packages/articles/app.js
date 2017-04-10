'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Articles = new Module('articles');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Articles.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Articles.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  // Articles.menus.add({
  //   'roles': ['authenticated'],
  //   'title': 'Articles',
  //   'link': 'all articles'
  // });
  Articles.menus.add({
    'roles': ['authenticated'],
    'title': 'Assigned Schedule',
    'link': 'Assigned Schedule'
  });
  // wei tang
  Articles.menus.add({
  'roles': ['admin'],
  'title': 'Add School',
  'link': 'Add School'
  });
  Articles.menus.add({
  'roles': ['authenticated'],
  'title': 'Friends',
  'link': 'Friends'
  });
  Articles.menus.add({
    'roles': ['authenticated'],
    'title': 'Search Students',
    'link': 'Search Students'
  });
  Articles.menus.add({
    'roles': ['authenticated'],
    'title': 'View Course Offering',
    'link': 'View Course Offering'
  });
  Articles.menus.add({
    'roles': ['authenticated'],
    'title': 'Friend Requests',
    'link': 'Friend Requests'
  });
  Articles.menus.add({
    'roles': ['authenticated'],
    'title': 'Course Schedule',
    'link': 'Course Schedule'
  });
  Articles.menus.add({
    'roles': ['authenticated'],
    'title': 'Preferences',
    'link': 'Preferences'
  });

  // weitang

  //Articles.aggregateAsset('js','/packages/system/public/services/menus.js', {group:'footer', absolute:true, weight:-9999});
  //Articles.aggregateAsset('js', 'test.js', {group: 'footer', weight: -1});

  /*
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Articles.settings({'someSetting':'some value'},function (err, settings) {
      //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Articles.settings({'anotherSettings':'some value'});

    // Get settings. Retrieves latest saved settings
    Articles.settings(function (err, settings) {
      //you now have the settings object
    });
    */
  Articles.aggregateAsset('css', 'articles.css');

  return Articles;
});
