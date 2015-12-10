var app = angular.module("form");


app.controller('EditLiftCtrl' , ['$scope', 'FormState', 'FormLifts', 
                    function($scope, FormState, FormLifts){
    



    $scope.s = FormState;
    $scope.m = {
        notes:"",
        lift:undefined,
        weight:undefined,
    }

        //make sure we aren't here in error
    if(FormState.lifts[FormState.selectedLift]==undefined){
        //we aren't ready for this, send us back home
        FormState.goHome();
    }else{
            //set the notes to what they should be
        $scope.m.lift = FormState.lifts[FormState.selectedLift];
        $scope.m.notes = $scope.m.lift.notes;
        $scope.m.weight = $scope.m.lift.weight;
    }
   
    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.m.lift = FormState.lifts[FormState.selectedLift];
        $scope.m.notes = $scope.m.lift.notes;
        $scope.m.weight = $scope.m.lift.weight;
    })
   


    $scope.setLiftScore = function(score){
        var d = {'score':score};
        if($scope.m.notes!=$scope.m.lift.notes){
            d['notes'] = $scope.m.notes;
        }
        FormLifts.updateLift(d);
        FormState.goHome();
    }
    $scope.saveLiftData = function(){
        //console.log('here')
        var d = {};
        if($scope.m.notes!=$scope.m.lift.notes){
            console.log('editing notes')
            d['notes'] = $scope.m.notes;
        }
        if($scope.m.weight!=$scope.m.lift.weight){
            console.log('editing weight'+$scope.m.weight)
            d['weight'] = $scope.m.weight;
        }
        if(d!={}){
            FormLifts.updateLift(d);
        }
        FormState.goHome();
    }



    $scope.$on('newLiftSelected', function (event, data) {
        $scope.m.lift = data.lift;
        $scope.m.notes = $scope.m.lift.notes;
        $scope.m.weight = $scope.m.lift.weight;
    });


   
    

}]);