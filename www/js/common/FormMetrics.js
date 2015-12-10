//This is for all the configuration we need
var app = angular.module("form");

//FormMetrics has all of the methods that will deal with metrics
app.factory('FormMetrics', ['$rootScope','FormGlobals', 'FormState' ,function($rootScope,FormGlobals, FormState) {
    var fs = FormState;
    //This is how much work is required for each lift. Right now we calculate it every time a new lifter is loaded
    var liftWorks = {};
    var setLiftWorks = function(userHeights){
        //here, we take the custom heights and figure out how much work is done for each type of lift
        //fs.heightDefaults = {'hang-narrow': 0.582, 'rack-narrow': 1.242, 'oh-narrow': 1.855, 'squat-rack-narrow': 0.654, 'bench-down': -0.449};
        //console.log(userHeights)
        var heights  = _.reduce(userHeights , function(out, val,key) {
            out[key.substring(0,key.lastIndexOf('-'))]=val; return out; 
        },{});

        heights['bench-down'] = heights['bench'];
        heights['bench-up'] = 0;
        delete heights['bench'];
        heights['ground'] = 0;
        heights['squat-oh'] = heights['squat-rack'] + (heights['oh']-heights['rack']); 

        var heightDelta, currentHeight, lastHeight;
        _.each(FormGlobals.liftTypes,function(liftType){
            lastHeight = 0;
            liftWorks[liftType.id] = _.reduce(liftType.positions,function(total, position, idx){
                currentHeight = heights[position];
                if(currentHeight==undefined){
                    currentHeight = heights[position.substring(0,position.lastIndexOf('-'))];
                }
                //console.log(position,currentHeight);

                if(idx>0){
                    //see if the bar was moving up
                    heightDelta = currentHeight - lastHeight;
                    if(heightDelta>0){
                        total += heightDelta;
                    }
                }
                lastHeight = currentHeight;
                return total;
            },0);
        },this);
        //console.log(liftWorks);
    }

    //set up some things to auto run when we need them to
    $rootScope.$on('lifterChanged', function (event, data) {
        setLiftWorks(data.heights)
    });



    var service = {};

    //change metric sets a new metric that is displayed
    service.changeMetric= function(idx,metricKey,liftTypeID){
        //console.log('change metric',fs.metricsDisplay)

        if(idx==undefined || metricKey==undefined){return;}

        //lets always use the parent of the lift type if it exists
        var liftTypeID = FormGlobals.liftTypeParent(liftTypeID) || liftTypeID;

        console.log('lift Type:'+liftTypeID);

        //get the full metric
        var metric = FormGlobals.metricByKey(metricKey);
        if(!metric){console.log('invalid metric');return;}
        
        //if we have a session metric, set metric display
        if(metric.session){
            fs.metricsDisplay['session'][idx] = metric.key;
            //we also need to overwrite the last lift specific metric
            if(_.has(fs.metricsDisplay,''+liftTypeID)){
                fs.metricsDisplay[''+liftTypeID][idx] = '';
            }
        }else{
            //if it is a lift type metric, we should add it to the current lift type
            //First, intialize //
            if(!_.has(fs.metricsDisplay,''+liftTypeID)){
                fs.metricsDisplay[''+liftTypeID] = ['','',''];
            }
            //then, add it
            fs.metricsDisplay[''+liftTypeID][idx] = metric.key;
        }
        $rootScope.$broadcast('metricChanged',
                {   metric:metric,
                    metricsDisplay:fs.metricsDisplay }
            );
       service.getMetricForIdx(idx,liftTypeID);

    };
    


    //this combines the custom metric info with the default info
    service.getMetric = function(metricKey){
        var defaultMetric = _.cloneDeep(FormGlobals.metricByKey(metricKey));
        var userMetric =  _.findWhere(fs.userMetrics,{'key':metricKey});
        return _.extend({},defaultMetric,userMetric);
    };


    //This figures out which metric should be where
    service.getMetricForIdx = function(idx,liftTypeID){
        //console.log(fs.metricsDisplay)
        if(fs.lifts[fs.selectedLift]==undefined){return;}
        if(liftTypeID==undefined){
            if(fs.lifts[fs.selectedLift]==undefined){return;}
            liftTypeID =fs.lifts[fs.selectedLift].liftType ;

        }

        var liftTypeID = FormGlobals.liftTypeParent(liftTypeID) || liftTypeID;
        var liftType = FormGlobals.liftTypeByID(liftTypeID);

        var metricKey;
        //check if we have specific metrics for the lift type
        if(_.has(fs.metricsDisplay,''+liftTypeID) && fs.metricsDisplay[''+liftTypeID][idx]!=''){
            metricKey = fs.metricsDisplay[''+liftTypeID][idx];
        
        //or, check out the default metrics for the given lift type
        }else if(!_.has(liftType,'defaultMetrics') && liftType.defaultMetrics[idx]!=''){
           metricKey = liftType.defaultMetrics[idx];
        
        //next, look for a session metric that fits
        }else if(fs.metricsDisplay['session'][idx]!=''){
            metricKey = fs.metricsDisplay['session'][idx];
    
        //last, just grab a metricDefault        
        }else{
             metricKey = fs.metricsDisplay['default'][idx];
        }

        //now, return the metric
                //console.log('setting'+idx+":"+fs.getMetric(metricKey).name)
        var metric = service.getMetric(metricKey);
        $rootScope.$broadcast('metricSet',
                {   mIdx:idx,
                    weight: fs.lifts[fs.selectedLift].weight || 0,
                    
                    currentLiftMetrics: fs.lifts[fs.selectedLift].metrics || {},
                    liveMetrics: fs.liveMetrics,
                    liftMetrics: fs.liftMetrics,
                    metric: service.getMetric(metricKey),
                    metricsDisplay:fs.metricsDisplay }
            );

        return metric;
    };
    //things that would change which metric to use:
        //lift changed
    $rootScope.$on('newLiftSelected', function (event, data) {
        service.updateLiveMetrics();
        service.updateSessionMetrics();
        service.getMetricForIdx(0,data.lift.liftType);
        service.getMetricForIdx(1,data.lift.liftType);
        service.getMetricForIdx(2,data.lift.liftType);
    });


    //this is how we customize metrics, used for setting ranges and colors for now
    service.setCustomMetric = function(metricKey,data){
        if(!_.has(fs.userMetrics,metricKey)){
            //means we don't have that custom metric yet
            fs.userMetrics[metricKey] = data;
        }else{
            //just extend the data that is there
            fs.userMetrics[metricKey] = _.extend(fs.userMetrics[metricKey],data);
        }
        $rootScope.$broadcast('userMetricsChanged',{userMetrics:fs.userMetrics});

    };

    //this just deletes the user metric from the list
    service.resetDefaults = function(metricKey){
        fs.userMetrics[metricKey] = {};
        $rootScope.$broadcast('userMetricsChanged',{userMetrics:fs.userMetrics});
    };





    /////////////////////////////////////
    ///SECTION FOR ACTUALLY CALCULATING METRICS
    /////////////////////////////////////


    //Here is where we update all the session metrics we need
    service.updateLiveMetrics = function(){
        var cTime = (new Date()).getTime();
        var numLifts = fs.lifts.length;
        if(numLifts==0){return;}
  

        var timeLastLift = (cTime - fs.lifts[numLifts-1].cTime)/1000;
        if(timeLastLift > 24*60*60*60){fs.liveMetrics['timeLastLift'] = undefined;}
        else{fs.liveMetrics['timeLastLift'] = FormGlobals.timeStr(timeLastLift);}

        //console.log(fs.liveMetrics['timeLastLift'])
        //get metrics from the lifts
        fs.liftMetrics = _.map(fs.lifts,function(lift){
            return [lift.cTime, lift.metrics || {}, lift.weight];
        });

        $rootScope.$broadcast('liveMetricsUpdated', 
            {liveMetrics:fs.liveMetrics});
    }


    $rootScope.$on('heartbeat',function(event, data){
        service.updateLiveMetrics();
    });


    service.updateSessionMetrics = function(){
        var numLifts = fs.lifts.length;
        if(numLifts==0){return;}
        fs.liveMetrics['avgRest'] = FormGlobals.timeStr((fs.lifts[numLifts-1].cTime-fs.lifts[0].cTime)/1000/(numLifts-1));
        fs.liveMetrics['numOfLifts'] = fs.lifts.length;

        var totalTime = (fs.lifts[numLifts-1].cTime-fs.lifts[0].cTime)/1000;
        fs.liveMetrics['sessionTime']  = FormGlobals.timeStr(totalTime);  //seconds
        if(numLifts>=3){
            fs.liveMetrics['3repSpeed'] = parseInt(10*60000/(fs.lifts[numLifts-1].cTime-fs.lifts[numLifts-3].cTime))/10;
        }else{
            fs.liveMetrics['3repSpeed'] = undefined;
        }

  
        fs.liveMetrics['totalWork'] = service.findWork();

        fs.liveMetrics['avgPower'] = fs.liveMetrics['totalWork'] * 1000 / totalTime;

        //console.log(fs.liveMetrics['totalWork']);

        
        //console.log(JSON.stringify(fs.liveMetrics))

        //get metrics from the lifts
        fs.liftMetrics = _.map(fs.lifts,function(lift){
            return [lift.cTime, lift.metrics || {}, lift.weight];
        });


        $rootScope.$broadcast('sessionMetricsUpdated', 
            {liveMetrics:fs.liveMetrics, liftMetrics:fs.liftMetrics, selectedLift:fs.selectedLift});
    }


    service.findWork = function(){
        //this will just go through sdf
        //1 meter kilogram-force = 0.009 806 65 kilojoule
        //console.log(fs.lifts)
        return _.reduce(fs.lifts,function(total, lift){
            //console.log(lift)
            return total += lift.weight*0.45359237 * liftWorks[lift.liftType] * 0.0098;  //kg*meter
        },0);
    }

    service.fixMetricUnits = function(val, metric, weight){
        return FormGlobals.fixMetricUnits(val, metric, weight);
    }

    


    return service;

}]);

