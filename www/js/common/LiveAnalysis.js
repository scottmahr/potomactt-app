//This is for all the configuration we need
var app = angular.module("form");




app.service('LiveAnalysis', function(FormGlobals) {
    var self = this;
    
    this.liftProgess = 0;
    this.lastEvent = 0;
    this.liftingMessage
    this.heights = {'hang': 0.582, 'shoulder': 1.242, 'overhead': 1.855, 'squat': 0.562, 'bench': -0.449};



    this.cleanDetection = function(height,time){
        //first, we look for the bar on the ground

        if(this.liftProgress == 0 && Math.abs(height) < .2){
            //Ready for the lift
            this.liftProgress =1;
            liftLastEvent = time;
            return 'ready to lift';
        }else if(this.liftProgress==1 && height>this.heights['hang']){
            //Means we have started
            this.liftProgress =2;
            liftLastEvent = time;
            
            return {msg:'lift started',startLift:true};
        }else if(this.liftProgress==2 && height>this.heights['shoulder']-.5  && Math.abs(kalmanVelocity)<.5){
        //Then we look for it to get close to shoulders and velocity close to zero
        setLiftingMessage('cleaned','green');
        this.liftProgress =3;
        liftLastEvent = accelCount;
        }else if(this.liftProgress==3 &&height <.25){
        //Then we wait for it to go back to close to the ground and the velocity to get close to zero
        this.liftProgress = 4;
        liftLastEvent = accelCount;
        //save the lift
        setLiftingMessage('found clean'+liftPoints.length,'green');
        postLiftWait = -parseInt(.5/dt);
        }

        if(this.liftProgress>1 && accelCount-liftLastEvent > 6000){

          this.liftProgress = 0;
          setLiftingMessage('took too long','red');

        }

        //if we are lifting, add the lift points
        if(this.liftProgress>1){
        liftPoints.push(accelData[accelCount % longBufferLen]);
        postLiftWait++;
        if(this.liftProgress == 4 && postLiftWait == 0){
          console.log('saving...');
          newLift(liftPoints,true,{});
          this.liftProgress = 0;
          console.log('saved...');
          setLiftingMessage('saved clean'+liftPoints.length,'green');
        }
        }
    


    }
    


});



