var app = angular.module("form");


app.controller('HomeCtrl',['$scope','$state','$ionicAnalytics','FormState','FormEditState','FormLifts','FormGlobals', 
            function($scope,$state,$ionicAnalytics,FormState,FormEditState, FormLifts,FormGlobals){
    $scope.s = FormState; 
    $scope.lift = {};


    $scope.wPer = function(weight,liftTypeID){
        if(weight==undefined){
            weight = FormState.weight;
            liftTypeID = FormState.liftType.id;
        }

        return parseInt(100*weight/FormState.maxes[liftTypeID]);
    }

    $scope.setWeight = function(val){
        FormEditState.setWeight(val);
    };
    $scope.changeWeight = function(){
        FormState.vibrate();
        FormState.animateDirection = 'slide-left';
        $state.go('weights');
    };
    $scope.changeLiftType = function(){
        FormState.vibrate();
        FormState.animateDirection = 'slide-right';
        $state.go('liftTypes');
    };

    $scope.deleteLift = function(){
        if(FormState.lifts.legnth==0){return;}
        FormState.vibrate();
        FormLifts.deleteLift();
    }


    $scope.setLiftScore = function(score){
        if(FormState.lifts.legnth==0){return;}
        FormState.vibrate();
        var d = {'score':score};
        FormLifts.updateLift(d);
    }


    //Metrics Stuff//////////////
    /////////////////////////////

    $scope.editMetric = function(idx){
        $ionicAnalytics.track('Edit Metric', {
            idx: idx,
            user: FormState.lifter.name,
        });


        FormState.vibrate();
        if(FormState.lifts.length==0){return;}
        FormState.metricEdit = idx;
        $scope.s.animateDirection = 'slide-down';
        $state.go('editMetric');
    }

    $scope.showPlot = function(num){
        var idx = _.indexOf(FormState.plotTypeOpts,FormState.plotType);
        idx = (idx+num+3)%FormState.plotTypeOpts.length;
        FormState.plotType = FormState.plotTypeOpts[idx];
    }

    $scope.$on('newLiftSelected', function (event, data) {
        

        //hyper.log('got broadcast in metrics');
        if(data.lift == undefined){
            $scope.lift = {};
        }else{
            $scope.lift = data.lift;
            //let's get out of the quick weight change
            if(FormState.plotType=='quick weight change'){FormState.plotType = 'lift plot';}
        }
        //debug = $scope.metrics;
    });
    FormEditState.setSelectedLift();


    //Gets the percentage of the weight
    $scope.wPer = function(weight,liftTypeID){
        if(weight==undefined){
            weight = FormState.weight;
            liftTypeID = FormState.liftType.id;
        }
        return parseInt(100*weight/FormState.maxes[liftTypeID]);
    }

    $scope.changeLiftIcon = function(event){
        FormState.vibrate();
        //this is where we should allow users to set height
        FormState.settingHeight = true;
    };
    $scope.changeDataCollection = function(event){
        FormState.vibrate();
        if(FormState.dataCollectionState == 'play'){
            FormState.dataCollectionState = 'pause';
        }else{
            FormState.dataCollectionState = 'play';
        }
    };

    $scope.statusClick = function(){
        FormEditState.statusClick();


    };

    $scope.setHeight = function(pos){
        //this is for setting the height of the barbell
        console.log(pos)
        FormState.settingHeight = false;
        if(pos=='offBar'){
            //FormBTLE.resetTouch();
        }else{
            var cElev = FormState.heights[pos+'-narrow'];
            if(pos=='ground'){cElev=0;}

            var elevs = FormState.elevRaw.wSlice(FormState.elevCount-50,FormState.elevCount);
            var aElevs = FormGlobals.myAverage(elevs);
            FormState.elevOffset += aElevs.mean-cElev ;
        }

    }


    $scope.editLift = function(){
        if(FormState.lifts.length==0){return;}
        FormState.navTo('editLift');
    };

    //now, lets tell the metrics what they are


    $scope.$on('$ionicView.beforeEnter', function() {
       // Code you want executed every time view is opened
      
        $scope.lift = {};
        $scope.$broadcast('clearData',{});
        FormEditState.setSelectedLift();
       
    })



}]);

















