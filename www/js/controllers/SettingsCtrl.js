var app = angular.module("form");

app.controller('SettingsCtrl', ['$scope','FormState', function($scope, FormState){
    $scope.s = FormState;
    $scope.m =  {
        generalSettings : ['weightUnits','quickWeightChange','vibrate'],
        plotSettings : [],
    }

    $scope.logStuff = function(){
        console.log($scope.generalSettings)
        console.log($scope.plotSettings)
    };

 
}]);