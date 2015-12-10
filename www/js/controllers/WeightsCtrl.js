var app = angular.module("form");



app.controller('WeightsCtrl' ,['$scope','FormState','FormEditState' , function($scope, FormState, FormEditState){
    $scope.s = FormState;
    $scope.m = {
        prevDrag : 0,
        deltaDrag : 0,
        pxperlb : 5,
        weight: 0,
        max:5,
        weightMsg:"lifting"
    };
    //s.options.weightUnits.selected = 0 kgs
    //s.weight    //in lbs
    //liftType  //id of the lift type
   
    $scope.changeWeight = function(weight){
        if(weight==undefined || weight==0){return;}
        FormEditState.setWeight(weight);
    }

    $scope.changeWeightUnits = function(){
        FormEditState.changeWeightUnits();
    }
    
    $scope.toggleSetMax = function(){
        FormEditState.toggleSetMax();
    }
    $scope.$on('weightChanged', function (event, data) {
        $scope.m.weight = data.weight;  //this will always be in lbs
        $scope.m.max = data.max;
        $scope.m.weightMsg = 'lifting';
        //console.log('weight changed'+data.weightRange[1])
    });
    $scope.$on('maxChanged', function (event, data) {
        $scope.m.weight = data.max;  //this will always be lbs
        $scope.m.weightMsg = 'set '+data.liftType.name+' max';
        //console.log('max changed'+data.max)
    });

    

    FormEditState.setWeight(0);
}]);







