var app = angular.module("form");

app.controller('EditLifterCtrl' ,['$scope','FormState','FormLifters' , function($scope, FormState, FormLifters){
    $scope.s = FormState;

    $scope.m  ={
        editing: false
    }




    $scope.calibrate = {
            icons : _.zip(_.range(6),FormState.calibPositions),
            msgs:["",
                "put collar on bar with light weight",
                "hold each position highlighted",
                "press go when ready to start",
                "calibrating...",
                "calibration complete!"
                ],
            calibIdx:0,
            positionIdx:-1,
            btnTxt:['calibrate oly heights','next step','next step','Go!','cancel','finish'],
            duration:5,

        };

    $scope.calibrate2 = {
            icons : _.zip(_.range(6),FormState.calibPositions2),
            msgs:["",
                "put collar on bar with light weight",
                "hold each position highlighted",
                "press go when ready to start",
                "calibrating...",
                "calibration complete!"
                ],
            calibIdx:0,
            positionIdx:-1,
            btnTxt:['calibrate benchpress','next step','next step','Go!','cancel','finish'],
            duration:5,

        };

    $scope.showChangeLifter = false;

    //console.log('lifters')
    //console.log($scope.m)

    $scope.fields = [
            ['name', 'first last',FormState.lifter.name, function(t){FormState.lifter.name=t.toLowerCase();} , 
                function(t){
                    if(t.length>6 && t.split(' ').length>1){return true;}
                    return false;
                }
            ],
            ['weight', 'lbs',FormState.lifter.weight ,function(t){FormState.lifter.weight=parseFloat(t);},  
                function(t){
                    if(t==undefined || t.length==0 || isNaN(t)){return false;}
                    if(parseFloat(t)<50 || parseFloat(t)>500 ){return false;}
                    return true;
                }
            ],
            ['height',"in", FormState.lifter.height ,function(t){FormState.lifter.height=parseFloat(t);},  
                function(t){
                    if(t==undefined || t.length==0 || isNaN(t)){return false;}
                    if(parseFloat(t)<45 || parseFloat(t)>96 ){return false;}
                    return true;
                }
            ]
    ];



  

    $scope.goToLifters = function(){
        $scope.s.animateDirection = 'slide-left';
        FormState.navTo('lifters');
    };

    
    /////CALIBRATING/////////////////////////
    /////////////////////////////////////////

    $scope.calibHeights = function(){
        if(!$scope.s.dataFlowing){return;}
        if($scope.calibrate.calibIdx<3){
            //go to the next message
            $scope.calibrate.calibIdx++;
        }else if($scope.calibrate.positionIdx==-1){
            //go to the next position
            $scope.calibrate.positionIdx++;
            $scope.startTimer();
            $scope.calibrate.calibIdx = 4;
        }else{
            if($scope.calibTimer!=undefined){$interval.cancel($scope.calibTimer);}
            $scope.calibrate.calibIdx=0;
            $scope.calibrate.positionIdx=-1;
        }
    };

    $scope.calibHeights2 = function(){
        if(!$scope.s.dataFlowing){return;}
        if($scope.calibrate2.calibIdx<3){
            //go to the next message
            $scope.calibrate2.calibIdx++;
        }else if($scope.calibrate2.positionIdx==-1){
            //go to the next position
            $scope.calibrate2.positionIdx++;
            $scope.startTimer2();
            $scope.calibrate2.calibIdx = 4;
        }else{
            if($scope.calibTimer!=undefined){$interval.cancel($scope.calibTimer);}
            $scope.calibrate2.calibIdx=0;
            $scope.calibrate2.positionIdx=-1;
        }
    };

    $scope.startTimer = function(){
        $scope.calibTimer = $interval(function() {
            var val = FormState.heightCalib($scope.calibrate.positionIdx,$scope.calibrate.duration);
            //console.log('calib idx:'+$scope.calibrate.positionIdx+" val:"+val);
            $scope.calibrate.positionIdx++;
            if($scope.calibrate.positionIdx>5){
                $scope.calibrate.calibIdx++;
                 $interval.cancel($scope.calibTimer);
                 $scope.calibTimer = undefined;
                 if(FormState.dataFlowing && FormState.lifter.name!='no lifter'){
                    FormState.calcHeightCalib();
                 }
            }
        }, $scope.calibrate.duration*1000+2000);  //gives them a second and a half to get there
    }

    $scope.startTimer2 = function(){
        $scope.calibTimer = $interval(function() {
            var val = FormState.heightCalib($scope.calibrate2.positionIdx,$scope.calibrate2.duration);
            //console.log('calib idx:'+$scope.calibrate2.positionIdx+" val:"+val);
            $scope.calibrate2.positionIdx++;
            if($scope.calibrate2.positionIdx>5){
                $scope.calibrate2.calibIdx++;
                 $interval.cancel($scope.calibTimer);
                 $scope.calibTimer = undefined;
                 if(FormState.dataFlowing && FormState.lifter.name!='no lifter'){
                    FormState.calcHeightCalib();
                 }
            }
        }, $scope.calibrate2.duration*1000+2000);  //gives them a second and a half to get there
    }



    $scope.cancelResults = function(){
        if($scope.s.lifterAction=='edit'){
            FormLifters.restoreLifter();
        }else{
            FormState.lifter = {};
        }
        FormState.navTo('lifters');
    };

    $scope.saveResults = function(){

        if($scope.s.lifterAction=='edit'){
            var updated = FormLifters.updateLifter(FormState.lifter);
            if(!updated){ FormLifters.restoreLifter(FormState.lifter); }
        }else{
            FormLifters.createLifter(FormState.lifter);
        }
        FormState.navTo('lifters');
    };

    $scope.deleteLifter = function(){
        FormLifters.deleteLifter(FormState.lifter);
        FormState.navTo('lifters');
    };


    $scope.$on('hidePicture', function(event, mass) { $scope.m.editing = true; });
    $scope.$on('showPicture', function(event, mass) { $scope.m.editing = false; });


//
}]);