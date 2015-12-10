// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('twc', ['ionic','ionic.service.core','ionic.service.analytics', 'twc.controllers', 'twc.services','restangular','ngCordova'])



app.run(function($ionicPlatform,$ionicAnalytics,Leagues,Teams,Games) {
   $ionicAnalytics.register();
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
});

app.config(['$ionicAutoTrackProvider', function($ionicAutoTrackProvider) {
  // Don't track which elements the user clicks on.
  $ionicAutoTrackProvider.disableTracking('Tap');
  //$ionicAutoTrackProvider.disableTracking();
}])

app.config(function($ionicConfigProvider) {
    $ionicConfigProvider.backButton.text('').icon('ion-chevron-left').previousTitleText(false);
    $ionicConfigProvider.tabs.position("bottom"); //Places them at the bottom for all OS
})

app.config(function($stateProvider, $urlRouterProvider,RestangularProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('landing', {
    url: '/landing',
    templateUrl: 'templates/landing.html',
    controller: 'LandingCtrl'
  })
  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  // Each tab has its own nav history stack:
  .state('tab.passport', {
    url: '/passport',
    views: {
      'tab-passport': {
        templateUrl: 'templates/tab-passport.html',
        controller: 'PassportCtrl'
      }
    }
  })
  .state('tab.feed', {
      url: '/feed',
      views: {
        'tab-feed': {
          templateUrl: 'templates/tab-feed.html',
          controller: 'FeedCtrl'
        }
      }
    })
  .state('tab.feed-detail', {
      url: '/feeds/:feedId',
      views: {
        'tab-feed': {
          templateUrl: 'templates/feed-detail.html',
          controller: 'FeedDetailCtrl'
        }
      }
    })
  .state('tab.directory', {
    url: '/directory',
    views: {
      'tab-directory': {
        templateUrl: 'templates/tab-directory.html',
        controller: 'DirectoryCtrl'
      }
    }
  })

    // setup an abstract state for the tabs directive
    .state('tab2', {
    url: '/tab2',
    abstract: true,
    templateUrl: 'templates/tabs2.html'
  })
  // Each tab2 has its own nav history stack:
  .state('tab2.scan', {
    url: '/scan',
    views: {
      'tab2-scan': {
        templateUrl: 'templates/tab2-scan.html',
        controller: 'ScanCtrl'
      }
    }
  })
  .state('tab2.feed', {
      url: '/feed',
      views: {
        'tab2-feed': {
          templateUrl: 'templates/tab2-feed.html',
          controller: 'BoxFeedCtrl'
        }
      }
    })
  .state('tab2.edit', {
    url: '/edit',
    views: {
      'tab2-edit': {
        templateUrl: 'templates/tab2-edit.html',
        controller: 'EditCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/landing');

   RestangularProvider.setBaseUrl('http://potomactt.herokuapp.com/api');
  //RestangularProvider.setBaseUrl('http://localhost:5000/api');

    RestangularProvider.setRestangularFields({
      id: "_id"
    });

});



Date.prototype.mmddyyyy = function() {
   var yyyy = this.getFullYear().toString();
   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
   var dd  = this.getDate().toString();
   return (mm[1]?mm:"0"+mm[0]) +'/'+ (dd[1]?dd:"0"+dd[0]) +'/'+    yyyy; // padding
  };