//This is for all the configuration we need
var app = angular.module("form");



app.service('FormKalman', function(FormGlobals) {
    var self = this;
    
    //kalman stuff
    this.KM;this.bothKO;this.accelKO;this.elevKO;
    
    this.kalmanCount = 0;
    this.kalmanRaw = [_.range(9.8,1600,0),_.range(9.8,1600,0),_.range(9.8,1600,0)]; //accel,vel,pos

    
    this.setUpKalman = function(accelErr,elevErr){
    //Start at 0 position, 0 velocity, 0 accel
        var dt = .005;
        var x_0 = $V([0,0,0]);
        var P_0 = $M([
                [27,0,0],
                [0,15,0],
                [0,0,0]
              ]); //we know the start position really well
        var F_k = $M([
                [1,dt,2*dt*dt/2],
                [0,1,dt],
                [0,0,1]
              ]); //how the state is carried to the next state
       
        var Q_k = $M([
                [0.000225,0,0],
                [0,0.045,0],
                [0,0,9]
              ]); 

        this.KM = new KalmanModel(x_0,P_0,F_k,Q_k);

        var z_k = $V([0,0]); //pos,acceleration
        var H_k = $M([
                  [1,0,0],
                  [0,0,1]
                ]); //Describes relationship between model and observation
        var R_k = $M([
                  [elevErr,0],
                  [0,accelErr]
                ]); // Describes noise from sensor.

        this.bothKO = new KalmanObservation(z_k, H_k, R_k);


        z_k = $V([0]); //accel
        H_k = $M([
                  [0,0,1]
                ]); //Describes relationship between model and observation
        R_k = $M([accelErr]); // Describes noise from sensor.
        this.accelKO = new KalmanObservation(z_k, H_k, R_k);


        z_k = $V([0]); //pos
        H_k = $M([
                  [1,0,0]
                ]); //Describes relationship between model and observation
        R_k = $M([elevErr]); // Describes noise from sensor.
        this.elevKO = new KalmanObservation(z_k, H_k, R_k);

    }


    this.applyKalman = function(accel,elev){
      if(accel!=undefined && elev!=undefined){
        //console.log([elev,accel])
        this.bothKO.z_k = $V([elev,accel]);
        this.KM.update(this.bothKO);
      }else if(accel!=undefined){
        //console.log('only accel')
        this.accelKO.z_k = $V([accel]);
        this.KM.update(this.accelKO);
      }else if(elev!=undefined){
        //console.log('only elev')
        this.elevKO.z_k = $V([elev]);
        this.KM.update(this.elevKO);
      }

      this.kalmanCount++;
      //console.log([this.KM.x_k.elements[2],this.KM.x_k.elements[1],this.KM.x_k.elements[0]])
      return [this.KM.x_k.elements[2],this.KM.x_k.elements[1],this.KM.x_k.elements[0]];
      //this.kalmanRaw[this.kalmanCount%1600] = [KM.x_k.elements[2],KM.x_k.elements[1],KM.x_k.elements[0]];

    }



});



