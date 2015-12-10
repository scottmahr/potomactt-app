var app = angular.module("form");

app.controller('LiftersCtrl' ,['$scope','FormState','FormEditState','FormLifters' , 
                    function($scope, FormState, FormEditState,FormLifters){
    $scope.s = FormState;

    $scope.m  ={
        sortByName : false,
    }


    $scope.showChangeLifter = false;

   

    $scope.goToLifters = function(){
        $scope.s.animateDirection = 'slide-left';
        $location.path('/lifters');
    };

    ////////////////////////////
    /////LIFTER PAGE///////

    $scope.toggleChangeLifter = function(){
        $scope.showChangeLifter = !$scope.showChangeLifter;
    };

    $scope.orderLifters = function(lifter){
        if($scope.m.sortByName){
            return lifter.name.toLowerCase();
        }else{
            if(_.has(FormState.loggedInUser,'_id')  &&   lifter._id==FormState.loggedInUser._id){
                return -1000000000;
            }
            if(lifter.lifts==undefined){return 0;}
            return -lifter.lifts.length;
        }
    }
//

    $scope.editLifter = function(){
        if(!FormState.lifter){return;}
        FormState.lifterAction = 'edit';
        FormState.animateDirection = 'slide-right';
        FormState.navTo('editLifter')
    };

    $scope.addLifter = function(){
        FormEditState.addLifter();
    };
  

    $scope.loadSampleLifts = function(){
        //This should set the lifter to no lifter, then load the sample lifts
        FormState.setLifter();
        FormData.loadSampleLifts();


        FormState.goHome();
    };


////



    $scope.setUser = function(lifterID){
        FormEditState.setLifterByID(lifterID);
        $scope.showChangeLifter = !$scope.showChangeLifter;
        FormState.goHome();

        //if they have lifts we need to sort through them
    };
    $scope.displayLifter = function(){
        console.log(FormState.lifter)
    
    };



}]);