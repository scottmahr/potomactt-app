var app = angular.module("form");

app.controller('AdminCtrl' , ['$scope', '$location','$timeout', 'FormState','FormEditState','FormBTLE',
      function($scope, $location,$timeout, FormState,FormEditState,FormBTLE){
    $scope.s = FormState;
    $scope.m = {
        settingTest : true,
        generalSettings : ['weightUnits','quickWeightChange','simpleMetrics',
                            'liftingFromRack','lastLift'],

    };
    
    $scope.calibTouch = function(){
        //console.log('changing led');
        FormBTLE.resetTouch();
    }

    $scope.connect = function(){
        console.log('connecting');
        FormBTLE.initFormCollar();
        FormState.goHome();
    }


    $scope.findUpdates = function(){
        FormEditState.checkForUpdates();
    }

    $scope.visionPage = function(){
        console.log('here')
        $location.path('/vision');
    }


 
}]);//