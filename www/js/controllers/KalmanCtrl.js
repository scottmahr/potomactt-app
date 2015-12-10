var app = angular.module("form");

app.controller('KalmanCtrl' , function($scope,$routeParams,Restangular,$timeout,FormKalman, FormAnalysis, FormData,FormGlobals){
    $scope.input = {'name':'','date':''};
    $scope.d = FormData;
    $scope.lift,$scope.liftData;
    $scope.lifters = [];
    $scope.selectedLift = 0;

    //console.log($routeParams);

    if(_.has($routeParams,'name')){
        $scope.input.name = $routeParams.name;
    }

    if(_.has($routeParams,'date')){
        $scope.input.date = new Date($routeParams.date);
    }

    if(_.has($routeParams,'liftNum')){
        $scope.selectedLift = parseInt($routeParams.liftNum);
        //console.log($scope.selectedLift)
    }





    $scope.loadAll = function(){
        console.log('loading'+FormData.lifters.length)
        var lifter = _.find(FormData.lifters,function(lifter){
            //if(!_.has(lifter,'name')){console.log(lifter._id)}
            return lifter.name.toLowerCase()==$scope.input.name.toLowerCase();
        })
        //console.log(lifter)

        if(lifter!=undefined && $scope.input.date!=''){
            //now we load everything we will need
            var start = $scope.input.date.getTime();

            // GET /lifters/123/lifts?query=params
            //console.log('trying to get lifts')
            lifter.getList("lifts", {'startTime': start,'endTime':start+86400000}).then(
                function(lifts) {
                    $scope.lifts = _.sortBy(lifts,'cTime');
                    if($scope.lifts.length>0){
                        $scope.nextLift(0);
                    }
                    //console.log("Got lifts");
                }, function errorCallback() {
                    console.log("Oops error from server :(");
                }
            )


        }
    }
    $scope.analyzeAll = function(){


        console.log('analyze '+$scope.lifts.length)
        
    }
    $scope.saveAll = function(){
        
    }
    $scope.showMetrics = function(){
        console.log($scope.lifts[$scope.selectedLift].metrics)
    }


    $scope.nextLift = function(num){
        if(num==undefined){$scope.selectedLift = 0;}
        else{
            $scope.selectedLift = ($scope.selectedLift+num+$scope.lifts.length)%$scope.lifts.length;
        }
        
        if(!_.has($scope.lifts[$scope.selectedLift],'acceleration')){
            $scope.lifts[$scope.selectedLift].get().then(function(lift){
                $scope.lifts[$scope.selectedLift] = lift;
                $scope.loadData($scope.lifts[$scope.selectedLift]);
                
            });
        }else{
            $scope.loadData($scope.lifts[$scope.selectedLift]);
        }



    }


    $scope.loadData = function(lift){


        var liftData = FormAnalysis.analyzeLift(lift);
        //console.log('data - boom')
        //console.log(lift)
    
        var offset = FormGlobals.myAverage(_.pluck(lift.altitude,1)).mean - 
                     FormGlobals.myAverage(_.pluck(lift.vision,2)).mean;
        var vision = _.map(lift.vision,function(v){return [v[0],v[2]+offset];});




        var raw = [lift.acceleration,lift.altitude,vision];

        $scope.$broadcast('kalmanPlot',
                {raw:raw,yaxes:[0,1,1], plotIdx:1}   //,ranges:[[0,30],[-.25,1.75],[-3,3]]}
            );
        

        raw = [
            _.zip(_.range(liftData.filtElev.length),liftData.filtElev),
            _.zip(_.range(liftData.filtvel.length),liftData.filtvel),
            _.zip(_.range(liftData.filtVisionVel.length),liftData.filtVisionVel),
            _.zip(_.range(liftData.filtVision.length),liftData.filtVision),
            ];

        $scope.$broadcast('kalmanPlot',
            {raw:raw,yaxes:[3,2,2,3], plotIdx:2,circles:circles}     //,ranges:[[0,30],[-.25,1.75],[-3,3]]}
        );




        var raw2 = [
            _.zip(_.range(liftData.filtAccel.length),liftData.filtAccel),
            _.zip(_.range(liftData.filtElev.length),liftData.filtElev),
            _.zip(_.range(liftData.filtvel.length),liftData.filtvel),
            _.zip(_.range(liftData.filtASlope.length),liftData.filtASlope),
            ];

        var m = lift.metrics;
         var circles = [    //idx,x,y
                [2,m['maxVelIdx'],m['maxVel']],
                [0,m['hipDriveIdx'],m['hipDrive']],
                [0,m['floatIdx'],m['float']],
                [0,m['catchIdx'],m['catch']],
                [0,m['transitionIdx'],m['transition']],
                [0,m['firstPullIdx'],m['firstPull']],
                [0,m['startIdx'],0],

                [1,m['squatBottomIdx'],m['squatBottom']],
                [2,m['minVelIdx'],m['minVel']],
                [2,m['maxVelIdx'],m['maxVel']],
                [0,m['squatBottomForceIdx'],m['squatBottomForce']],
                [0,m['squatStartMinIdx'],m['squatStartMin']],
                [0,m['squatEndMinIdx'],m['squatEndMin']],

                [0,m['jumpForceIdx'],m['jumpForce']],
                [0,m['landingForceIdx'],m['landingForce']],
                [1,parseInt((m['landingForceIdx']-m['jumpForceIdx'])/2+m['jumpForceIdx']),m['maxElev']],


                [2,m['squatVelStartIdx'],0],
                [2,m['squatVelEndIdx'],0],

                //deadlift
                [0,m['deadliftPullIdx'],m['deadliftPull']],
                [0,m['deadliftFinishIdx'],0],
                [0,m['startIdx'],0],

                //jerk
                [2,m['jerkMaxVelIdx'],m['jerkMaxVel']],
                [0,m['jerkFirstPushIdx'],m['jerkFirstPush']],
                [0,m['jerkSecondPushIdx'],m['jerkSecondPush']],
                [1,m['firstPushHeightIdx'],m['firstPushHeight']],

                //thurster
                [0,m['thrusterEndMinIdx'],m['thrusterEndMin']],
                [0,m['thursterPushIdx'],m['thursterPush']],
         ];

        $scope.$broadcast('kalmanPlot',
            {raw:raw2, plotIdx:3,circles:circles}     //,ranges:[[0,30],[-.25,1.75],[-3,3]]}
        );


    }

    $scope.analyzeClean = function(lift,liftData){
        if(lift == undefined){
            lift = $scope.lifts[$scope.selectedLift];
        }
        
        if(liftData == undefined){
            liftData = FormAnalysis.analyzeLift(lift);
        }


        lift = FormAnalysis.doAnalysis(lift,liftData);
        var m = lift.metrics;

        //console.log($scope.lifts[$scope.selectedLift].metrics)

        var filtered = [
            _.zip(_.range(liftData.filtAccel.length),liftData.filtAccel),
            _.zip(_.range(liftData.filtElev.length),liftData.filtElev),
            _.zip(_.range(liftData.filtvel.length),liftData.filtvel),
            ];



         var circles = [    //idx,x,y
                [2,m['maxVelIdx'],m['maxVel']],
                [0,m['hipDriveIdx'],m['hipDrive']],
                [0,m['floatIdx'],m['float']],
                [0,m['catchIdx'],m['catch']],
                [0,m['transitionIdx'],m['transition']],
                [0,m['firstPullIdx'],m['firstPull']],
                [0,m['startIdx'],0],

                [1,m['squatBottomIdx'],m['squatBottom']],
                [2,m['minVelIdx'],m['minVel']],
                [2,m['maxVelIdx'],m['maxVel']],
                [0,m['squatBottomForceIdx'],m['squatBottomForce']],
                [0,m['squatStartMinIdx'],m['squatStartMin']],
                [0,m['squatEndMinIdx'],m['squatEndMin']],
                [2,m['squatVelStartIdx'],0],
                [2,m['squatVelEndIdx'],0],

                [1,m['benchBottomIdx'],m['benchBottom']],
                [0,m['benchBottomForceIdx'],m['benchBottomForce']],
                [0,m['benchStartMinIdx'],m['benchStartMin']],
                [0,m['benchEndMinIdx'],m['benchEndMin']],
                [2,m['benchVelStartIdx'],0],
                [2,m['benchVelEndIdx'],0],

                //deadlift
                [0,m['deadliftPullIdx'],m['deadliftPull']],
                [0,m['deadliftFinishIdx'],0],
                [0,m['startIdx'],0],

                //jerk
                [2,m['jerkMaxVelIdx'],m['jerkMaxVel']],
                [0,m['jerkFirstPushIdx'],m['jerkFirstPush']],
                [0,m['jerkSecondPushIdx'],m['jerkSecondPush']],
                [1,m['firstPushHeightIdx'],m['firstPushHeight']],

                //thurster
                [0,m['thrusterEndMinIdx'],m['thrusterEndMin']],
                [0,m['thursterPushIdx'],m['thursterPush']],



         ];
        $scope.$broadcast('kalmanPlot',
            {raw:filtered, plotIdx:3, circles:circles }   //ranges:[[0,30],[-.25,1.75],[-3,3]]
        );


    }

    $scope.saveLift = function(lift){
        //console.log('we are saving now...')
        if(lift == undefined){
            lift = $scope.lifts[$scope.selectedLift];
        }

        //console.log(lift.metrics)

        lift.put().then(function(){
            console.log('lift updated');
        },function(){
            console.log('error deleting lift');
        });

        
    }

    $scope.deleteLift = function(lift){
        //console.log('we are saving now...')
        if(lift == undefined){
            lift = $scope.lifts[$scope.selectedLift];
        }

        //console.log(lift.metrics)

        lift.remove().then(function(){
            console.log('lift deleted');
        },function(){
            console.log('error deleting lift');
        });

        
    }



    $scope.runKalman = function(){

        //console.log($scope.lift);

        var accel = $scope.lift.acceleration
        var elev = $scope.lift.altitude;

        FormKalman.setUpKalman(100,.5);
        //console.log(FormKalman.KM)
        //console.log(FormKalman.bothKO)
        //console.log(FormKalman.accelKO)

        var kalmanData = _.map(accel,function(a,idx){
            if(idx%4==0){
                return FormKalman.applyKalman(a[1],elev[idx/4][1]);
            }else{
                return FormKalman.applyKalman(a[1]);
            }
        });

        //console.log(kalmanData)
        var t = _.range(kalmanData.length);

        raw = [
            _.zip(t,_.pluck(kalmanData,0)),
            _.zip(t,_.pluck(kalmanData,2)),
            _.zip(t,_.pluck(kalmanData,1)),
            ];

         //console.log(raw)

        $scope.$broadcast('kalmanPlot',
            {raw:raw, plotIdx:3}   //,ranges:[[0,30],[-.25,1.75],[-3,3]]}
        );


    }


    $scope.downloadData = function(lift){
        if(lift == undefined){
            lift = $scope.lifts[$scope.selectedLift];
        }
        liftData = FormAnalysis.analyzeLift(lift);

        var csvData = [[]];


        csvData.push(['Lift ID',lift._id,'cTime',lift.cTime]);
        csvData.push(['Accel Time','Accel Value (m/s2)','Elev Time','Elevation (m)','vision Time','vision x','vision y','vision z','accel','vel','elev']);
        var csvRow;
        _.each(lift.acceleration,function(accel,idx){
            if(idx<lift.altitude.length){
                accel = accel.concat(lift.altitude[idx])
            }else{accel =accel.concat(['',''])}

            if(idx<lift.vision.length){
                accel = accel.concat(lift.vision[idx])
            }else{accel =accel.concat(['','','',''])}

            if(idx<liftData.filtAccel.length){
                accel = accel.concat(liftData.filtAccel[idx])
            }else{accel =accel.concat([''])}

            if(idx<liftData.filtvel.length){
                accel = accel.concat(liftData.filtvel[idx])
            }else{accel =accel.concat([''])}

            if(idx<liftData.filtElev.length){
                accel = accel.concat(liftData.filtElev[idx])
            }

            csvData.push(accel)
        });


        FormGlobals.downloadCSV(csvData,'Lift-'+lift.cTime);
        
    }


    $scope.downloadMetricData = function(){

        var csvData = [[]];

        var headers = [];
        _.each($scope.lifts,function(lift){
            headers = headers.concat(_.keys(lift.metrics));
        });
        headers = ['cTime'].concat( _.uniq(headers));

        csvData.push(headers);

        var csvRow;
        _.each($scope.lifts,function(lift){
            csvRow = _.map(headers,function(h){
                if(_.has(lift.metrics,h)){return lift.metrics[h];}
                return '';
            });


            

            csvData.push([lift.cTime].concat(csvRow));
        });


        FormGlobals.downloadCSV(csvData,'Metric Data');
        
    }


    if(_.has($routeParams,'name') && _.has($routeParams,'date')){
        //console.log('loading')
        $timeout(function(){
            $scope.loadAll();
        },3500)
            
    }

});