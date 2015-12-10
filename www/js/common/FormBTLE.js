//This is for all the configuration we need
var app = angular.module("form");


app.service('FormBTLE', ['$q','$timeout','FormGlobals','FormState','FormLiveData', 
            function($q,$timeout,FormGlobals,FormState,FormLiveData) {
    var fs = FormState;
    //here are all the private functions that are only called by the public functions
    var device = null;


    var disconnectDevice = function(){
        if (device){
            device.close();
            device = null;
        }
    }
    
    var connectToClosestDevice = function(){

        console.log('connecting to closest collar...');
        var deferred = $q.defer();

        disconnectDevice();
        evothings.easyble.stopScan();
        evothings.easyble.reportDeviceOnce(false);

        var stopScanTime = Date.now() + 2000
        var closestDevice = null
        var strongestRSSI = -1000
        evothings.easyble.startScan(
            function(returnDevice){
                // Connect if we have found a sensor tag.
                //console.log(JSON.stringify(device));
                if ((returnDevice != null) && (returnDevice.name != null) &&
                       (returnDevice.name.indexOf('Form Collar') > -1) &&
                     returnDevice.rssi != 127){ // Invalid RSSI value
                    if (returnDevice.rssi > strongestRSSI){
                        closestDevice = returnDevice
                        strongestRSSI = returnDevice.rssi
                    }
                }
                if (Date.now() >= stopScanTime){
                    evothings.easyble.stopScan();
                    device = closestDevice;
                    if(device==null){
                        deferred.reject('no collar found');
                    }else{
                        deferred.resolve('found form collar');
                    }
                }
            },
            function(errorCode){
                deferred.reject('Scan failed');
            })


        return deferred.promise;
    }


    var connectToDevice = function(){
        var deferred = $q.defer();
        if(device==undefined || device==null){
            deferred.reject('we do not have a collar yet');
        }else{
            device.connect(
                function(device){
                    deferred.resolve({'mac':device.address});
                },
                function(errorCode){
                    deferred.reject('Connect failed');
                }
            )
        }
        return deferred.promise;
    }


    var readServices = function(){
        console.log('reading services')
        var deferred = $q.defer();
        device.readServices(
            [],
            function(services){
                //console.log('got services:'+JSON.stringify(services))
                console.log('got services:')
                
                deferred.resolve('found services');
            },
            function(errorCode){
                console.log('error getting services');
                deferred.reject('error: '+errorCode);
            }
        );
        return deferred.promise;
    }

    //generic stuff to turn things on
    var sensorOn = function(dataUUID,notificationUUID,notificationFunction){
        var deferred = $q.defer();
        // Only start sensor if a notification function has been set.
        if (!notificationFunction) { return }

        //console.log('starting a service...');
        // Set sensor notification to ON.
        device.writeDescriptor(
            dataUUID, // Characteristic for data
            notificationUUID, // Configuration descriptor
            new Uint8Array([1,0]),
            function() {deferred.resolve('turned on data');},
            function(errorCode) {deferred.reject('error turning on data:'+errorCode);})

        // Start sensor notification.
        device.enableNotification(
            dataUUID,
            function(data) { notificationFunction(new Uint8Array(data)) },
            function(errorCode) {console.log('problem with data flow:'+errorCode);})
        return deferred.promise;
    }


    var setLED = function(r,g,b){
        //now, try to send a command
        console.log('setting led')
        device.writeCharacteristic(
            FormGlobals.LED_UUID,
            new Uint8Array([r,g,b]),
            function(){
                //console.log('good!')
            },
            function(errorCode){
                console.log('error code:'+errorCode)
            });
    }

    var sendCommand = function(command,params){
        device.writeCharacteristic(
            FormGlobals.COMMAND_UUID,
            new Uint8Array([command].concat(params)),
            function(){
                //console.log('good!')
            },
            function(errorCode){
                console.log('error code:'+errorCode)
            });
    }

    var readBattery = function(){
        device.readCharacteristic(
            FormGlobals.BATTERY_DATA,
            function(data){
                console.log('good!'+JSON.stringify(data))
            },
            function(errorCode){
                console.log('error codex:'+errorCode)
            });
    }

    var sensorOff = function(dataUUID){
        // Set sensor configuration to OFF
        configUUID && device.writeCharacteristic(
            configUUID,
            new Uint8Array([0]),
            function() {},
            function(errorCode){
                console.log('error code:'+errorCode)
            });

        dataUUID && device.disableNotification(
            dataUUID,
            function() {},
            function(errorCode){
                console.log('error code:'+errorCode)
            });
    }



    var service = {};

/*
    service.initVision = function(){
        //resetting status flags
        fs.visionMac = "";

        //Finding the closest collar
        connectToClosestDevice().then(
        function(msg) {
            console.log('discover succeeded:'+msg);
            
            //Connecting to the collar
            connectToDevice().then(
                function(response) {
                    fs.visionMac = response.mac;
                    console.log('vision connect succeeded:');
                    //Reading services
                    readServices().then(
                        function(services) {
                            console.log('got here')
                            //turn led green

                            notifyOn(
                                FormGlobals.VISION_DATA,
                                FormGlobals.VISION_NOTIFICATION,
                                self.visionHandler
                            );
                            console.log('after vision')


                        }, function(msg){
                            console.log('could not read services: '+msg);
                        }
                    );
                }, function(msg){
                    console.log('failed connect: '+msg);
                }
            );
        }, function(msg){
            console.log('failed discover:'+msg);
            
        });//


    }

*/


    service.initFormCollar = function(){
        //resetting status flags
        fs.connectedToCollar = false;
        fs.foundCollar=false;
        fs.collarMac = "";

        //Finding the closest collar
        connectToClosestDevice().then(
        function(msg) {
            console.log('discover succeeded:'+msg);
            fs.foundCollar=true;
            //Connecting to the collar
            connectToDevice().then(
                function(response) {
                    fs.connectedToCollar = true;
                    fs.collarMac = response.mac;
                    console.log('connect succeeded:');
                    //Reading services
                    readServices().then(
                        function(services) {
                            //console.log('got here')
                            //turn led green
                            //$timeout(function(){
                            //    setLED(0,255,0);
                            //},100);

                            $timeout(function(){
                                sensorOn(
                                    FormGlobals.BATTERY_DATA,
                                    FormGlobals.BATTERY_NOTIFICATION,
                                    service.batteryHandler
                                ).then(
                                    function(msg){
                                        console.log('battery stuff'+msg);
                                        //readBattery();
                                        //start data streaming
                            
                                    },function(msg){
                                        console.log('battery error'+msg);
                                    }
                                );
                            },300);
                            //$timeout(function(){
                            //    service.resetTouch();
                            //},900);
                            $timeout(function(){
                                sensorOn(
                                    FormGlobals.STATUS_DATA,
                                    FormGlobals.STATUS_NOTIFICATION,
                                    service.statusHandler
                                );
                            },600);
                            //Turning on the accelerometer
                            sensorOn(
                                FormGlobals.ACCELEROMETER_DATA,
                                FormGlobals.ACCELEROMETER_NOTIFICATION,
                                service.accelHandler
                            ).then(
                                function(msg){
                                    //console.log(msg);
                                    //start data streaming
                                    sendCommand(2,[1, 0, 1, 0]);
                                },function(msg){
                                    console.log(msg);
                                }
                            );
                        }, function(msg){
                            console.log('could not read services: '+msg);
                        }
                    );
                }, function(msg){
                    console.log('failed connect: '+msg);
                }
            );
        }, function(msg){
            console.log('failed discover:'+msg);
            
        });//


    }

    service.resetTouch = function(){
        sendCommand(4,[0,8,4,3,0,8,4,1]); 
        $timeout(function(){
            sendCommand(5,[0,0,0,0]); 
        },100)
    }


    service.setLED = function(r,g,b){
        console.log('led stuff')
        //setLED();

        setLED(r,g,b);
    }

    service.setDataStream = function(accel, aFilt, elev, eFilt){
        sendCommand(2, [accel, aFilt, elev, eFilt]);
    }

    service.zeroElevation = function(){
        sendCommand(1, []);
        fs.elevOffset = 0;
    }

    service.accelHandler = function(data){
        //console.log("data"+data.length)//
        // Calculate the x,y,z accelerometer values from raw data.
        //console.log(data.length)
        fs.lastDataTime = (new Date()).getTime();

        FormLiveData.accelData(_.slice(data,0,2));
        FormLiveData.accelData(_.slice(data,2,4));
        FormLiveData.accelData(_.slice(data,4,6));
        FormLiveData.accelData(_.slice(data,6,8));
        FormLiveData.elevData(_.slice(data,8,9));
    }

    service.batteryHandler = function(data){
        console.log('battery'+JSON.stringify(data))
        FormLiveData.setBattery(data[0]);
    }
    service.statusHandler = function(data){
        console.log('status'+JSON.stringify(data))
        if(data[0]==6){
            fs.liftProgress = 0;
            
            //check to see if setting is set
            if(fs.optionOn('quickWeightChange')){
                fs.plotType = 'quick weight change';
            }
            
            $timeout(function(){
                console.log('zeroing elevation');
                service.zeroElevation();
            },500)
            $timeout(function(){
                fs.captureData = true;
            },1500)
        }else if(data[0]==1){
            fs.captureData = false;
            fs.liftProgress = 0;
        }
        //fs.setBattery(data[0]);
    }

    service.visionHandler = function(data){
        var txt = "";
        _.each(data,function(code){
            txt += String.fromCharCode(code);
        });
        FormLiveData.setVisionData(txt);
    }
    service.visionCommand = function(msg){
        sendCommand(msg);
    }

//
    return service;
}]);





