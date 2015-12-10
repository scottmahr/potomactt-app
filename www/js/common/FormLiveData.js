//fs is for all the configuration we need
var app = angular.module("form");

//FormLiveData takes care of all the data that comes from the collar
app.factory('FormLiveData', ['$rootScope','FormGlobals','FormState' ,'FormLifts',
                function($rootScope, FormGlobals, FormState, FormLifts) {
    var fs = FormState;

    var service = {};

    service.setBattery = function(batLevel){
        fs.batteryLevel = batLevel;
        if(batLevel<33){fs.batteryRange = 3;}
        else if(batLevel<37){fs.batteryRange = 2;}
        else{fs.batteryRange = 1;}
        console.log('battery level:'+fs.batteryLevel)
    }

/*    //VISION STUFF
        setVisionData : function(data){
            fs.visionCount++;
            //if(fs.visionCount%100==0){console.log('vision')}

            fs.visionData = data;
           
            if(data.length==12 && data.indexOf('|')==-1){
                //fs is position
                fs.visionPositions = {'left':[0,0],'right':[0,0],'position':[125,-323,3000]};
                fs.visionPositions.position = [(parseInt(data.substring(0,4))-5000)/1000,
                                                 (parseInt(data.substring(4,8))-5000)/1000,
                                                 (parseInt(data.substring(8,12))-5000)/1000];
                fs.lastVisionTime = (new Date()).getTime(); //fs is so we know if we have current data

            }else{
                //fs is debug
                var pos = data.split('|');
                if(pos.length>0 && pos[0].length>0){
                    fs.visionPositions.left = [parseInt(pos[0].substring(0,3)),parseInt(pos[0].substring(3,6))]
                }
                if(pos.length>1 && pos[1].length>0){
                    fs.visionPositions.right = [parseInt(pos[1].substring(0,3)),parseInt(pos[1].substring(3,6))]
                }
            }

            //use fs to tell our debug page we have more data
            $rootScope.$broadcast('visionPositionUpdated',
                    {positions:fs.visionPositions}
                );

            //console.log(data)
            //$rootScope.$apply();
        }
*/



    service.elevData = function(data,update){
        if(!fs.captureData){return;}
        if(fs.paused){return;}
        

        fs.elevCount++;
        //console.log('elevation');
        if(data[0] > 127){data[0] -= 256;}

        if( fs.elevCount==1){
            fs.elevOffset = (data[0]/10);
        }

        //change it to meters and offset it
        fs.elevRaw[fs.elevCount%400] = (data[0]/10)-fs.elevOffset;
        //we need to make sure the value is not really wrong
        //if(Math.abs(fs.elevRaw[fs.elevCount%400]-fs.elevRaw[(fs.elevCount+399)%400]) > 5){
        //    console.log('we see a bad elevation point');
        //    fs.elevRaw[fs.elevCount%400] = fs.elevRaw[(fs.elevCount+399)%400];
        //}

        //now lets take care of the vision data, which is also at 50hz
        if((new Date()).getTime() - fs.lastVisionTime < 200){
            //fs means we have a recent vision data point
            fs.visionRaw[fs.elevCount%400] = [fs.visionPositions.position[0],fs.visionPositions.position[1],fs.visionPositions.position[2]]
        }else{
            fs.visionRaw[fs.elevCount%400] = [0,0,0];
        }

        //console.log(x)
        if(fs.manualCapturing || fs.liftProgress>1){
            fs.capturedData[1].push(fs.elevRaw[fs.elevCount%400]);
            fs.capturedData[2].push(fs.visionRaw[fs.elevCount%400]);

        }


        var height1 = FormGlobals.myAverage(fs.elevRaw.wSlice(fs.elevCount-30,fs.elevCount-15)).mean
        var height = FormGlobals.myAverage(fs.elevRaw.wSlice(fs.elevCount-15,fs.elevCount)).mean
        fs.velocity = .95*fs.velocity + .05*(height-height1)/(15/50);

        var accel = FormGlobals.myAverage(fs.accelRaw.wSlice(fs.accelCount-25,fs.accelCount)).mean

        //if(fs.elevCount%25==0){console.log(fs.velocity);}

        if(fs.dataCollectionState=='pause' && fs.LDO != undefined && fs.lifter.name!='no lifter'){
            service.liftDetection(fs.LDO,accel, height,fs.velocity);
        }
        
        //temporary stuff to drive the icon
        
        if(fs.elevCount%15==0){
            if(!fs.dataFlowing){fs.liftIconIdx=0}
            else if(height<fs.heights['hang-narrow']/2){fs.liftIconIdx=1;}
            else if(height<(fs.heights['hang-narrow']+fs.heights['rack-narrow'])/2){fs.liftIconIdx=2;}
            else if(height<(fs.heights['rack-narrow']+fs.heights['oh-narrow'])/2){fs.liftIconIdx=3;}
            else {fs.liftIconIdx=4;} 
        }


        if(fs.elevCount%17==0){
            service.elevationCorrection();
        }


        if(fs.elevCount%25==0){
            //console.log('broadcast')
            $rootScope.$broadcast('updateLivePlot',{});
        }
   
    }

    service.accelData = function(data){
        if(!fs.captureData){return;}
        if(fs.paused){return;}

        fs.accelCount++;
        //fs is an accel reading
        fs.accelRaw[fs.accelCount%1600] = ((data[0]+256*data[1])/16384-1)*9.807;   //change to 0 for gravity
        //maybe capture it
        if(fs.manualCapturing || fs.liftProgress>1){
            fs.capturedData[0].push(fs.accelRaw[fs.accelCount%1600]);
        }
    }

    service.evalPos = function(h){
        //comes in as a string to be evaluated
        //first, replace all the known heights  
        
        h = ''+h;
        _.each(_.sortBy(_.keys(fs.heights),function(k){return -k.length;}),function(k){
            h = h.replace(k,fs.heights[k]);
        },fs);
        //console.log(h)
        return eval(h);
    }

    service.liftDetection = function(LDO,accel,elev,vel){
        var dt = .02
        var time = fs.elevCount * dt;
        //first do all the checks we want to do every time
        //save a lift after a little bit
        if(fs.liftProgress==10){
            fs.postLiftWait -= dt;
            if(fs.postLiftWait<0){
                //check real quick to see if the minimum lift length is there
                if(fs.capturedData[0].length/200 > LDO.minTime){
                    //only actually save the lift if we have a lifter selected
                    console.log('lift length',fs.capturedData[0].length/200)
                    if(_.has(fs.lifter,'_id')){
                        FormLifts.createLift();
                    }
                }
                fs.liftProgress = 0;
                console.log('saved')
            }
        }
        //check for timeout
        if(time-fs.lastLiftEvent > LDO.timeout){
            fs.liftProgress =0;
            //console.log('timed out');
            fs.lastLiftEvent = time;
        }

        var stage = _.findWhere(LDO.stages,{'start':fs.liftProgress});
        if(stage!=undefined){
            //we have a stage, see if all criteria pass, if they do, go to next stage
            if(_.has(stage,'elev-lt-abs')){
                if(Math.abs(elev) > service.evalPos(stage['elev-lt-abs'])){return false;} 
            }
            if(_.has(stage,'vel-lt-abs')){
                if(Math.abs(vel) > stage['vel-lt-abs']){return false;} 
            }
            if(_.has(stage,'elev-gt')){
                if(elev < service.evalPos(stage['elev-gt'])){return false;} 
            }
            if(_.has(stage,'elev-lt')){
                if(elev > service.evalPos(stage['elev-lt'])){return false;} 
            }
            //Accel stuff
            if(_.has(stage,'accel-gt')){
                if(accel < service.evalPos(stage['accel-gt'])){return false;} 
            }
            if(_.has(stage,'accel-lt')){
                if(accel > service.evalPos(stage['accel-lt'])){return false;} 
            }
            //distance stuff
            if(_.has(stage,'dist-gt')){
                if(elev-fs.lastDist < service.evalPos(stage['dist-gt'])){return false;} 
            }
            if(_.has(stage,'dist-lt')){
                if(elev-fs.lastDist > service.evalPos(stage['dist-lt'])){return false;} 
            }
            //passed everything, here is what we do if we pass//
            fs.liftProgress = stage.end;
            fs.lastLiftEvent = time;
            //fs starts the lift
            if(_.has(stage,'startLift')){service.startLift(stage['startLift']);}
            //fs sets how much time we want to collect after the lift
            if(_.has(stage,'postLiftWait')){fs.postLiftWait = stage['postLiftWait'];}
            //fs saves the spot so we can measure from here in the future
            if(_.has(stage,'startdist')){fs.lastDist = elev;}
        }
    }


    service.startLift = function(preLiftPad){
        fs.capturedData = [
            fs.accelRaw.wSlice(fs.accelCount-parseInt(preLiftPad/.005),fs.accelCount),
            fs.elevRaw.wSlice(fs.elevCount-parseInt(preLiftPad/.02),fs.elevCount),
            fs.visionRaw.wSlice(fs.elevCount-parseInt(preLiftPad/.02),fs.elevCount),
            ];
    }


    service.elevationCorrection = function(){
        //Look at the last 3 seconds of elevation and acceleration
        //decide if we should be adjusting the height to keep it in line 
        var elevs = fs.elevRaw.wSlice(fs.elevCount-50*2,fs.elevCount);
        var aElevs = FormGlobals.myAverage(elevs);
        var accels = fs.accelRaw.wSlice(fs.accelCount-200*2,fs.accelCount);
        var aAccels = FormGlobals.myAverage(accels);
        
        //console.log(JSON.stringify(aElevs))
        //console.log(JSON.stringify(aAccels))
        //console.log('bb')
        if(Math.abs(aElevs.mean)<.5 && aElevs.variance<.2 && aAccels.variance<.01 ){
            fs.elevOffset += .05*aElevs.mean
            fs.correctingElev = true;
            //console.log(fs.elevOffset)
        }else{
             fs.correctingElev = false;
        }
    }



    return service;
}]);

