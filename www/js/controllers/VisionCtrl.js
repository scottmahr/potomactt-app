var app = angular.module("form");

app.controller('VisionCtrl' , function($scope, $location,$timeout, FormBTLE, FormState,FormGlobals){
    $scope.s = FormState;
    $scope.settingTest = true;
    $scope.generalSettings = ['weightUnits','quickWeightChange','simpleMetrics',
                            'liftingFromRack','lastLift'];

    $scope.findVision = function(){
        console.log('finding collar');
        FormBTLE.initVision();
    }

    $scope.command = function(msg){
        FormBTLE.visionCommand(msg);
    }
});