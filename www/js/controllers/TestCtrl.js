var app = angular.module("form");

app.controller('testCtrl' , function($scope, FormGlobals, FormState, FormData){
    var model = {'test':'boom'}
    $scope.g = FormGlobals;
    $scope.s = FormState;
    $scope.d = FormData;
    $scope.m = model;
    $scope.metrics = {};

    

});