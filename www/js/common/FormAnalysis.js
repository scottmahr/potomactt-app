//This is for all the configuration we need
var app = angular.module("form");

//This does all the analysis of lifts
app.factory('FormAnalysis', [ 'FormGlobals', function(FormGlobals) {

    //These are all the private analysis things


    var offsetElev = function(elev){
        var offset = FormGlobals.myAverage(_.slice(elev,0,50)).mean;
        return _.map(elev,function(e){
            return e-offset;
        });
    }

    

    var verticalAnalysis = function(lift,liftData){
        console.log('analyzing a vertical leap...')
        //finding the starting index 
        var aslope =  liftData.filtASlope;
        var accels = liftData.filtAccel;
        var elevs = liftData.filtElev;
        var vels = liftData.filtvel;
        var t = liftData.time;
        var len = t.length;
        var dt = liftData.time[liftData.time.length-1]/liftData.time.length;
        
        

        //first, find start max force
        lift.metrics['jumpForce'] = _.max(accels.slice(0,len/2));
        lift.metrics['jumpForceIdx'] = _.indexOf(accels,lift.metrics['jumpForce']);

        lift.metrics['landingForce'] = _.max(accels.slice(len/2));
        lift.metrics['landingForceIdx'] = _.indexOf(accels,lift.metrics['landingForce']);

        //now, find hang time
        for(var i = lift.metrics['jumpForceIdx']; i <len; i++) {
            if(accels[i] <= 0){
                lift.metrics['takeoffIdx'] = i;
                break;
            }
        }
        for(var i = lift.metrics['landingForceIdx']; i > 0; i--) {
            if(accels[i] <= 0){
                lift.metrics['touchdownIdx'] = i;
                break;
            }
        }

        lift.metrics['hangTime'] = (lift.metrics['touchdownIdx']-lift.metrics['takeoffIdx'])*dt;
        

        //now, look at vertical from altimeter

        lift.metrics['startElev'] = FormGlobals.myAverage(elevs.slice(0,10)).mean;
        lift.metrics['maxElev'] = _.max(elevs.slice(lift.metrics['jumpForceIdx'],lift.metrics['landingForceIdx']));
        lift.metrics['deltaElev'] = (lift.metrics['maxElev'] - lift.metrics['startElev'])*39.37;




        console.log(lift.metrics)

        return lift;
    }

    var squatAnalysis = function(lift,liftData){
        console.log('analyzing a squat...')
        //finding the starting index 
        var aslope =  liftData.filtASlope;
        var accels = liftData.filtAccel;
        var elevs = liftData.filtElev;
        var vels = liftData.filtvel;
        var t = liftData.time;
        var dt = liftData.time[liftData.time.length-1]/liftData.time.length;
        
        

        //first, find min position
        lift.metrics['squatBottom'] = _.min(elevs);
        lift.metrics['squatBottomIdx'] = _.indexOf(elevs,lift.metrics['squatBottom']);
        

        //then find min and max velocity
        lift.metrics['minVel'] = _.min(vels.slice(0,lift.metrics['squatBottomIdx']));
        lift.metrics['minVelIdx'] = _.indexOf(vels,lift.metrics['minVel']);

        lift.metrics['maxVel'] = _.max(vels.slice(lift.metrics['squatBottomIdx']));
        lift.metrics['maxVelIdx'] = _.indexOf(vels,lift.metrics['maxVel']);


        //then find max push force at bottom
        lift.metrics['squatBottomForce'] = _.max(accels.slice(lift.metrics['minVelIdx'],lift.metrics['maxVelIdx']));
        lift.metrics['squatBottomForceIdx'] = _.indexOf(accels,lift.metrics['squatBottomForce']);



        //then find position when start and end velocity was zero
        for(var i = lift.metrics['minVelIdx']; i > 0; i--) {
            if(vels[i] >= 0){
                lift.metrics['squatVelStartIdx'] = i;
                break;
            }
        }

        for(var i = lift.metrics['maxVelIdx']; i < t.length; i++) {
            if(vels[i] <= 0){
                lift.metrics['squatVelEndIdx'] = i;
                break;
            }
        }


        //then find both accel mins, find time between them
        lift.metrics['squatStartMin'] = _.min(accels.slice(lift.metrics['squatVelStartIdx'],lift.metrics['squatBottomForceIdx']));
        lift.metrics['squatStartMinIdx'] = _.indexOf(accels,lift.metrics['squatStartMin']);

        lift.metrics['squatEndMin'] = _.min(accels.slice(lift.metrics['squatBottomForceIdx'],lift.metrics['squatVelEndIdx']));
        lift.metrics['squatEndMinIdx'] = _.indexOf(accels,lift.metrics['squatEndMin']);

        //find down, up ratio

        lift.metrics['downUpRatio'] = (lift.metrics['squatBottomForceIdx']-lift.metrics['squatStartMinIdx']) /
                            (lift.metrics['squatEndMinIdx']-lift.metrics['squatBottomForceIdx']);

        lift.metrics['squatTime'] = (lift.metrics['squatEndMinIdx']-lift.metrics['squatStartMin'])*dt;

        //last, find the depth of the squat
        lift.metrics['squatDepth'] = ( elevs[lift.metrics['squatVelStartIdx']] + elevs[lift.metrics['squatVelEndIdx']])/2-lift.metrics['squatBottom'];

        //now get average down and up speeds
        lift.metrics['avgDownVel'] = FormGlobals.myAverage(vels.slice(lift.metrics['squatVelStartIdx'],lift.metrics['squatBottomIdx'])).mean;
        lift.metrics['avgUpVel'] = FormGlobals.myAverage(vels.slice(lift.metrics['squatBottomIdx'],lift.metrics['squatVelEndIdx'])).mean;



        console.log(lift.metrics)

        return lift;
    }

    var thrusterAnalysis = function(lift,liftData){
        console.log('analyzing a thruster...')
        //finding the starting index 
        var aslope =  liftData.filtASlope;
        var accels = liftData.filtAccel;
        var elevs = liftData.filtElev;
        var vels = liftData.filtvel;
        var t = liftData.time;
        var dt = liftData.time[liftData.time.length-1]/liftData.time.length;
        
        

        //first, find min position
        lift.metrics['squatBottom'] = _.min(elevs.slice(0,parseInt(2/dt)));
        lift.metrics['squatBottomIdx'] = _.indexOf(elevs,lift.metrics['squatBottom']);

        lift.metrics['maxVel'] = _.max(vels.slice(lift.metrics['squatBottomIdx']));
        lift.metrics['maxVelIdx'] = _.indexOf(vels,lift.metrics['maxVel']);


        //then find max push force at bottom
        //lift.metrics['squatBottomForce'] = _.max(accels.slice(lift.metrics['maxVelIdx']-parseInt(1/dt),
        //                                                            lift.metrics['maxVelIdx']));

        lift.metrics['squatBottomForce'] = _.max(accels.slice(lift.metrics['squatBottomIdx']-parseInt(.25/dt),
                                                              lift.metrics['squatBottomIdx']+parseInt(.25/dt)));
        lift.metrics['squatBottomForceIdx'] = _.indexOf(accels,lift.metrics['squatBottomForce']);




        //then find both accel mins, find time between them
        lift.metrics['squatStartMin'] = _.min(accels.slice(0,lift.metrics['squatBottomForceIdx']));
        lift.metrics['squatStartMinIdx'] = _.indexOf(accels,lift.metrics['squatStartMin']);

        
        lift.metrics['thrusterEndMin'] = _.min(accels.slice(lift.metrics['maxVelIdx'],
                                                            lift.metrics['maxVelIdx']+parseInt(0.5/dt)));
        lift.metrics['thrusterEndMinIdx'] = _.indexOf(accels,lift.metrics['thrusterEndMin']);

        //now, find the second push
        var midPush = (lift.metrics['squatBottomForceIdx'] + lift.metrics['thrusterEndMinIdx'])/2;

        lift.metrics['thursterPush'] = _.max(accels.slice(midPush,lift.metrics['thrusterEndMinIdx']));
        lift.metrics['thursterPushIdx'] = _.indexOf(accels,lift.metrics['thursterPush']);


        lift.metrics['thrusterPushRatio'] = (lift.metrics['thursterPush'])/(lift.metrics['squatBottomForce']);
       
        lift.metrics['thrusterTime'] = (lift.metrics['thrusterEndMinIdx']-lift.metrics['squatStartMin'])*dt;

        console.log(lift.metrics)

        return lift;
    }

    var benchAnalysis = function(lift,liftData){
        console.log('analyzing a benchpress...')
        //finding the starting index 
        var aslope =  liftData.filtASlope;
        var accels = liftData.filtAccel;
        var elevs = liftData.filtElev;
        var vels = liftData.filtvel;
        var t = liftData.time;
        var dt = liftData.time[liftData.time.length-1]/liftData.time.length;
        
        

        //first, find min position
        lift.metrics['benchBottom'] = _.min(elevs);
        lift.metrics['benchBottomIdx'] = _.indexOf(elevs,lift.metrics['benchBottom']);
        

        //then find min and max velocity
        lift.metrics['minVel'] = _.min(vels.slice(0,lift.metrics['benchBottomIdx']));
        lift.metrics['minVelIdx'] = _.indexOf(vels,lift.metrics['minVel']);

        lift.metrics['maxVel'] = _.max(vels.slice(lift.metrics['benchBottomIdx']));
        lift.metrics['maxVelIdx'] = _.indexOf(vels,lift.metrics['maxVel']);


        //then find max push force at bottom
        lift.metrics['benchBottomForce'] = _.max(accels.slice(lift.metrics['minVelIdx'],lift.metrics['maxVelIdx']));
        lift.metrics['benchBottomForceIdx'] = _.indexOf(accels,lift.metrics['benchBottomForce']);



        //then find position when start and end velocity was zero
        for(var i = lift.metrics['minVelIdx']; i > 0; i--) {
            if(vels[i] >= 0){
                lift.metrics['benchVelStartIdx'] = i;
                break;
            }
        }

        for(var i = lift.metrics['maxVelIdx']; i < t.length; i++) {
            if(vels[i] <= 0){
                lift.metrics['benchVelEndIdx'] = i;
                break;
            }
        }


        //then find both accel mins, find time between them
        lift.metrics['benchStartMin'] = _.min(accels.slice(lift.metrics['benchVelStartIdx'],lift.metrics['benchBottomForceIdx']));
        lift.metrics['benchStartMinIdx'] = _.indexOf(accels,lift.metrics['benchStartMin']);

        lift.metrics['benchEndMin'] = _.min(accels.slice(lift.metrics['benchBottomForceIdx'],lift.metrics['benchVelEndIdx']));
        lift.metrics['benchEndMinIdx'] = _.indexOf(accels,lift.metrics['benchEndMin']);

        //find down, up ratio

        lift.metrics['downUpRatio'] = (lift.metrics['benchBottomForceIdx']-lift.metrics['benchStartMinIdx']) /
                            (lift.metrics['benchEndMinIdx']-lift.metrics['benchBottomForceIdx']);

        lift.metrics['benchTime'] = (lift.metrics['benchEndMinIdx']-lift.metrics['benchStartMin'])*dt;

        //last, find the depth of the bench
        lift.metrics['benchDepth'] = ( elevs[lift.metrics['benchVelStartIdx']] + elevs[lift.metrics['benchVelEndIdx']])/2-lift.metrics['benchBottom'];

        //now get average down and up speeds
        lift.metrics['avgDownVel'] = FormGlobals.myAverage(vels.slice(lift.metrics['benchVelStartIdx'],lift.metrics['benchBottomIdx'])).mean;
        lift.metrics['avgUpVel'] = FormGlobals.myAverage(vels.slice(lift.metrics['benchBottomIdx'],lift.metrics['benchVelEndIdx'])).mean;


        console.log(lift.metrics)

        return lift;
    }

    var cleanAnalysis = function(lift,liftData){
        console.log('analyzing a clean...')
        //finding the starting index 
        var aslope =  liftData.filtASlope;
        var accels = liftData.filtAccel;
        var elevs = liftData.filtElev;
        var vels = liftData.filtvel;
        var t = liftData.time;
        var dt = liftData.time[liftData.time.length-1]/liftData.time.length;

        //first, find the max velocity
        lift.metrics['maxVel'] = _.max(vels.slice(0,parseInt(2.5/dt)));
        lift.metrics['maxVelIdx'] = _.indexOf(vels,lift.metrics['maxVel']);

        //go find the hip drive
        lift.metrics['hipDriveIdx'] = 0;
        for(var i = lift.metrics['maxVelIdx']; i > 0; i--) {
            if(aslope[i] > 0 && aslope[i+1]<=0 ){
                lift.metrics['hipDriveIdx'] = i;
                lift.metrics['hipDrive'] = accels[lift.metrics['hipDriveIdx']];
                break;
            }
        }

        //then, find the hip drive
        //lift.metrics['hipDriveIdx'] = _.indexOf(accels,_.max(accels.slice(0,lift.metrics['maxVelIdx'])));
        //lift.metrics['hipDrive'] = accels[lift.metrics['hipDriveIdx']];

        //catch default
        lift.metrics['catchIdx'] = lift.metrics['hipDriveIdx']+parseInt(.75/dt);
        //finding the catch
        for(var i = lift.metrics['maxVelIdx']; i < t.length; i++) {
            if(aslope[i] > 0 && aslope[i+1] <= 0 && accels[i]>0) {
                lift.metrics['catchIdx'] = i;
                lift.metrics['catch'] = accels[lift.metrics['catchIdx']];
                lift.metrics['dropTime'] = t[lift.metrics['catchIdx']]-t[lift.metrics['hipDriveIdx']];
                break;
            }
        }

        //then find the float
        lift.metrics['float'] = _.min(accels.slice(lift.metrics['hipDriveIdx'],lift.metrics['catchIdx']));
        lift.metrics['floatIdx'] = _.indexOf(accels,lift.metrics['float']);


        //lift.metrics['catchIdx'] = _.indexOf(accels,_.max(accels.slice(lift.metrics['floatIdx'],lift.metrics['floatIdx']+parseInt(.5/dt)) ) );
        //lift.metrics['catch'] = accels[lift.metrics['catchIdx']];


        //Find transition between hip drive and first pull
        lift.metrics['transitionIdx'] = 0;
        for(var i = lift.metrics['hipDriveIdx']-10; i > 0; i--) {
            if(aslope[i] < 0) {
                lift.metrics['transitionIdx'] = i;
                lift.metrics['transition'] = accels[lift.metrics['transitionIdx']];
                break;
            }
        }

        //then, find the first pull 
        lift.metrics['firstPull'] =_.max(accels.slice(0,lift.metrics['transitionIdx']));
        lift.metrics['firstPullIdx'] = _.indexOf(accels,lift.metrics['firstPull']);

        //then try to find start of the lift
        //going to find the point before the first pull that gives us the steepest angle

        var tempSlope = _.map(accels.slice(0,lift.metrics['firstPullIdx']-parseInt(.1/dt)),function(v,i){
                return (lift.metrics['firstPull']-v) / (dt*(lift.metrics['firstPullIdx']-i));
            })
        lift.metrics['startIdx'] = _.indexOf(tempSlope,_.max(tempSlope));

        //a couple of other metrics

        lift.metrics['hipDriveRatio'] = lift.metrics['hipDrive']/9.8+1;
        lift.metrics['firstPullRatio'] = lift.metrics['firstPull']/9.8+1;

        //console.log(lift.metrics)
        console.log(lift.liftType)
        if(lift.liftType==4){
            //Means we have a clean and jerk
            lift = this.jerkAnalysis(lift,liftData);
        }

        return lift;
    }


    var snatchAnalysis = function(lift,liftData){
        console.log('analyzing a snatch...')
        //finding the starting index 
        var aslope =  liftData.filtASlope;
        var accels = liftData.filtAccel;
        var elevs = liftData.filtElev;
        var vels = liftData.filtvel;
        var t = liftData.time;
        var dt = liftData.time[liftData.time.length-1]/liftData.time.length;

        //first, find the max velocity
        lift.metrics['maxVel'] = _.max(vels.slice(0,parseInt(2.5/dt)));
        lift.metrics['maxVelIdx'] = _.indexOf(vels,lift.metrics['maxVel']);

        //go find the hip drive
        lift.metrics['hipDriveIdx'] = 0;
        for(var i = lift.metrics['maxVelIdx']; i > 0; i--) {
            if(aslope[i] > 0 && aslope[i+1]<=0){
                lift.metrics['hipDriveIdx'] = i;
                lift.metrics['hipDrive'] = accels[lift.metrics['hipDriveIdx']];
                break;
            }
        }

        //then, find the hip drive
        //lift.metrics['hipDriveIdx'] = _.indexOf(accels,_.max(accels.slice(0,lift.metrics['maxVelIdx'])));
        //lift.metrics['hipDrive'] = accels[lift.metrics['hipDriveIdx']];

        //catch default
        lift.metrics['catchIdx'] = lift.metrics['hipDriveIdx']+parseInt(.75/dt);
        //finding the catch
        for(var i = lift.metrics['maxVelIdx']; i < t.length; i++) {
            if(aslope[i] > 0 && aslope[i+1] <= 0 && accels[i]>0) {
                lift.metrics['catchIdx'] = i;
                lift.metrics['catch'] = accels[lift.metrics['catchIdx']];
                lift.metrics['dropTime'] = t[lift.metrics['catchIdx']]-t[lift.metrics['hipDriveIdx']];
                break;
            }
        }

        //then find the float
        lift.metrics['float'] = _.min(accels.slice(lift.metrics['hipDriveIdx'],lift.metrics['catchIdx']));
        lift.metrics['floatIdx'] = _.indexOf(accels,lift.metrics['float']);


        //lift.metrics['catchIdx'] = _.indexOf(accels,_.max(accels.slice(lift.metrics['floatIdx'],lift.metrics['floatIdx']+parseInt(.5/dt)) ) );
        //lift.metrics['catch'] = accels[lift.metrics['catchIdx']];


        //Find transition between hip drive and first pull
        lift.metrics['transitionIdx'] = 0;
        for(var i = lift.metrics['hipDriveIdx']-10; i > 0; i--) {
            if(aslope[i] < 0) {
                lift.metrics['transitionIdx'] = i;
                lift.metrics['transition'] = accels[lift.metrics['transitionIdx']];
                break;
            }
        }

        //then, find the first pull 
        lift.metrics['firstPull'] =_.max(accels.slice(0,lift.metrics['transitionIdx']));
        lift.metrics['firstPullIdx'] = _.indexOf(accels,lift.metrics['firstPull']);

        //then try to find start of the lift
        //going to find the point before the first pull that gives us the steepest angle

        var tempSlope = _.map(accels.slice(0,lift.metrics['firstPullIdx']-parseInt(.1/dt)),function(v,i){
                return (lift.metrics['firstPull']-v) / (dt*(lift.metrics['firstPullIdx']-i));
            })
        lift.metrics['startIdx'] = _.indexOf(tempSlope,_.max(tempSlope));

        //a couple of other metrics

        lift.metrics['hipDriveRatio'] = lift.metrics['hipDrive']/9.8+1;
        lift.metrics['firstPullRatio'] = lift.metrics['firstPull']/9.8+1;

        console.log(lift.metrics)

        return lift;
    }

    var deadliftAnalysis = function(lift,liftData){
        console.log('analyzing a deadlift...')
        //finding the starting index 
        var aslope =  liftData.filtASlope;
        var accels = liftData.filtAccel;
        var elevs = liftData.filtElev;
        var vels = liftData.filtvel;
        var t = liftData.time;
        var dt = liftData.time[liftData.time.length-1]/liftData.time.length;

        //first, find the max velocity
        lift.metrics['maxVel'] = _.max(vels.slice(0,parseInt(2.5/dt)));
        lift.metrics['maxVelIdx'] = _.indexOf(vels,lift.metrics['maxVel']);

        //go find the pull 
        lift.metrics['deadliftPull'] = _.max(accels.slice(0,lift.metrics['maxVelIdx']));
        lift.metrics['deadliftPullIdx'] = _.indexOf(accels,lift.metrics['deadliftPull']);


        //then find the finish
        var finishIdx = _.min(accels.slice(lift.metrics['maxVelIdx'],lift.metrics['maxVelIdx']+parseInt(.5/dt) ));
        lift.metrics['deadliftFinishIdx'] = _.indexOf(accels,finishIdx);

        //then try to find start of the lift
        //going to find the point before the first pull that gives us the steepest angle

        var tempSlope = _.map(accels.slice(0,lift.metrics['deadliftPullIdx']-parseInt(.1/dt)),function(v,i){
                return (lift.metrics['deadliftPull']-v) / (dt*(lift.metrics['deadliftPullIdx']-i));
            })
        lift.metrics['startIdx'] = _.indexOf(tempSlope,_.max(tempSlope));
        //a couple of other metrics
        lift.metrics['deadliftPullRatio'] = lift.metrics['deadliftPull']/9.8+1;

        lift.metrics['deadliftPullTime'] = t[lift.metrics['deadliftFinishIdx']]-
                                            t[lift.metrics['startIdx']];

        console.log(lift.metrics)
        return lift;
    }

    var jerkAnalysis = function(lift,liftData){
        console.log('analyzing a jerk...')
        //finding the starting index 
        var aslope =  liftData.filtASlope;
        var accels = liftData.filtAccel;
        var elevs = liftData.filtElev;
        var vels = liftData.filtvel;
        var t = liftData.time;
        var dt = liftData.time[liftData.time.length-1]/liftData.time.length;


        var startIdx = 0;
        if(_.has(lift.metrics,'catchIdx')){
            //means we have a clean
            startIdx = lift.metrics['catchIdx'];
        }


        //first, find the max velocity
        lift.metrics['jerkMaxVel'] = _.max(vels.slice(startIdx));
        lift.metrics['jerkMaxVelIdx'] = _.indexOf(vels,lift.metrics['jerkMaxVel']);

        //go find the first push
        lift.metrics['jerkFirstPush'] = _.max(accels.slice(0,lift.metrics['jerkMaxVelIdx']));
        lift.metrics['jerkFirstPushIdx'] = _.indexOf(accels,lift.metrics['jerkFirstPush']);

        //go find the second push
        lift.metrics['jerkSecondPush'] = _.max(accels.slice(lift.metrics['jerkMaxVelIdx']+parseInt(.25/dt), 
                                                lift.metrics['jerkMaxVelIdx']+parseInt(1/dt)));
        lift.metrics['jerkSecondPushIdx'] = _.indexOf(accels,lift.metrics['jerkSecondPush']);

        lift.metrics['secondPushRatio'] = (lift.metrics['jerkSecondPush'])/(lift.metrics['jerkFirstPush']);

        console.log(lift.metrics['jerkFirstPush'],lift.metrics['jerkFirstPush']/9.8+1)
        console.log(lift.metrics['jerkSecondPush'],lift.metrics['jerkSecondPush']/9.8+1)
        console.log(lift.metrics['secondPushRatio'])

        lift.metrics['secondPushTime'] = t[lift.metrics['jerkSecondPushIdx']]-
                                            t[lift.metrics['jerkFirstPushIdx']];

        //then find the finish
        lift.metrics['firstPushHeight'] = _.max(elevs.slice(lift.metrics['jerkFirstPushIdx'],lift.metrics['jerkSecondPushIdx']));
        lift.metrics['firstPushHeightIdx'] = _.indexOf(elevs,lift.metrics['firstPushHeight']);



        console.log(lift.metrics);
        return lift;
    }


    //These are the public things we can call
    var service = {};

    //All this does is compile the data into a liftdata container so we can do analysis on it later
    service.analyzeLift = function(lift){
        //console.log('wee are analyzing...')
        //For analysis, we will pass in the lift
        //we will then build up other info in another object
        //we will pass back the lift with all the metrics added
        var liftData = {};

        //first, check if we have accels and elevations
        if(lift==undefined || lift.acceleration==undefined || lift.altitude==undefined){
            console.log('we need raw data to analyze a lift')
            return {};
        }


        //first, let's get filtered accels and elevs
        var aFilt = _.range(1,25,0);
        
        //console.log(_.pluck(lift.acceleration,1))
        liftData['time'] =  _.pluck(lift.acceleration,0);

        liftData['filtAccel'] = FormGlobals.mySmooth( _.pluck(lift.acceleration,1),aFilt);
        //console.log(liftData['filtAccel'])

        var eFilt = _.range(1,60,0);
        //we are going to expand the elevation data so that it matches the accel data
        var longHeight = _.flatten(_.map(_.pluck(lift.altitude,1),function(h){
            return [h,h,h,h];
        }));
        liftData['filtElev'] = FormGlobals.mySmooth( longHeight,eFilt);

        //now, deal with the vision data if it exists
        if(_.has(lift,'vision')){
            

            var visionFilt = _.range(1,40,0);
            //we are going to expand the elevation data so that it matches the accel data
            var longVision = _.flatten(_.map(_.pluck(lift.vision,2),function(v){
                return [v,v,v,v];
            }));
            //next, lets offset the vision height to the measured height, so they are easier to compare
            var offset = FormGlobals.myAverage(longHeight).mean - FormGlobals.myAverage(longVision).mean;

            //console.log(offset)
            //console.log(_.slice(longHeight,0,15))
            //console.log(_.slice(longVision,0,15))


            longVision = _.map(longVision,function(v){return v+offset;});
            //console.log(_.slice(longVision,0,15))

            liftData['filtVision'] = FormGlobals.mySmooth( longVision,visionFilt);
        }


        //offset the elevation data 
        //liftData['filtElev'] =  this.offsetElev(liftData['filtElev']);


        //now, let's get velocity
        var t =  liftData['time'];
        liftData['velocity'] = _.map(liftData['filtElev'], function(h,idx){
            if(idx==0){return 0;}
            return (liftData['filtElev'][idx]-liftData['filtElev'][idx-1])/(t[idx]-t[idx-1]);
        });

        var vFilt = _.range(1,40,0);
        liftData['filtvel'] = FormGlobals.mySmooth( liftData['velocity'],vFilt);


        //now, get the velocity from the vision
        if(_.has(lift,'vision')){
            liftData['visionVel'] = _.map(liftData['filtVision'], function(h,idx){
            if(idx==0){return 0;}
                return (liftData['filtVision'][idx]-liftData['filtVision'][idx-1])/(t[idx]-t[idx-1]);
            });

            vFilt = _.range(1,40,0);
            liftData['filtVisionVel'] = FormGlobals.mySmooth( liftData['visionVel'],vFilt);
        }





        //now, lets get the slope of the accel
        liftData['aSlope'] = _.map(liftData['filtAccel'], function(h,idx){
            if(idx==0){return 0;}
            return (liftData['filtAccel'][idx]-liftData['filtAccel'][idx-1])/(t[idx]-t[idx-1]);
        });


        var slopeFilt = _.range(1,10,0);
        liftData['filtASlope'] = FormGlobals.mySmooth( liftData['aSlope'],slopeFilt);


        //Now, let's analyze a clean
        //console.log('returning lift data')
        return liftData;
    }



    service.doAnalysis = function(lift,liftData){   
        var liftType = _.findWhere(FormGlobals.liftTypes,{'id':lift.liftType});
        console.log(liftType.name)
        

        var analysisFuncs = [
            [ [1,4], cleanAnalysis],
            [ [5], squatAnalysis],
            [ [10], benchAnalysis],
            [ [93], verticalAnalysis],
            [ [2], snatchAnalysis],
            [ [3], deadliftAnalysis],
            [ [6], jerkAnalysis],
            [ [7], thrusterAnalysis],


        ];

        _.each(analysisFuncs,function(func){
            if(_.contains(func[0],liftType.id)  || _.contains(func[0],liftType.parent)){
                lift = func[1].call(this,lift,liftData);
            }
        },this);


        //then, let's fix up a few metrics for any lift
        lift.metrics['duration'] = liftData.time[liftData.time.length-1];

        return lift;
    }  



    return service;

}]);
