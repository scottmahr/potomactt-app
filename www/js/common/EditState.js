//This is for all the configuration we need
var app = angular.module("twc");

//FormEditState is what we use to do most of the edits to form state. 
//Does things like changing weights, lift types, lifters. 
app.factory('EditState', ['$rootScope','$cordovaGeolocation','$ionicAnalytics','Globals','State',
                function($rootScope,$cordovaGeolocation,$ionicAnalytics, Globals,State) {


    var service = {};

    
  // Update app code with new release from Ionic Deploy
    service.doUpdate = function() {
        $ionicDeploy.setChannel("dev");
        $ionicDeploy.update().then(function(res) {
          console.log('Ionic Deploy: Update Success! ', res);
          fs.updateAvaliable = false;
        }, function(err) {
          console.log('Ionic Deploy: Update error! ', err);
        }, function(prog) {
          console.log('Ionic Deploy: Progress... ', prog);
        });
    };

    // Check Ionic Deploy for new code
    service.checkForUpdates = function() {
        $ionicDeploy.setChannel("dev");
        console.log('Ionic Deploy: Checking for updates');
        $ionicDeploy.check().then(function(hasUpdate) {
          console.log('Ionic Deploy: Update available: ' + hasUpdate);
          fs.updateAvaliable = hasUpdate;
        }, function(err) {
          console.error('Ionic Deploy: Unable to check for updates', err);
        });
    };
    

    service.updateNearGyms = function(){
        console.log(State)
        if(!State.boxes || State.boxes.length<=0){return;}

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        
        $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
                State.myLat  = position.coords.latitude;
                State.myLong = position.coords.longitude;

                $ionicAnalytics.setGlobalProperties({
                  myLat: ''+State.myLat,
                  myLong: ''+State.myLong,
                });

                //now, see if any boxes are close
                var dist;
                
                var cBoxes = [];
                _.each(State.boxes,function(box){
                    dist = Globals.distance(State.myLat, State.myLong, box.latitude, box.longitude)
                    if(dist<10){
                        //means we are close, add it to the list
                        cBoxes.push([parseInt(dist*100)/100,box])
                    }
                });
                State.closeBoxes = cBoxes;
                
                }, function(err) {
                // error
            });

    }
    

    return service;


    
}]);

