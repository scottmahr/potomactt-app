//This is for all the configuration we need
var app = angular.module("form");


app.factory('FormLocal', ['$rootScope', 'FormState' ,'FormEditState',function($rootScope,FormState,FormEditState) {
    var fs = FormState;

    var service = {};

    service.saveLifter = function(lifter){
        //console.log('saved lifter:'+lifter.name)
        localStorage.setItem("lifterID", lifter._id); 
    }

    service.saveWeight = function(weight){
        localStorage.setItem("weight", weight); 
    }

    service.saveLiftType = function(liftType){
        localStorage.setItem("liftType", JSON.stringify(liftType)); 
    }//


    service.saveMetricsDisplay = function(metricsDisplay){
        localStorage.setItem("metricsDisplay", JSON.stringify(metricsDisplay)); 
    }

    service.saveUserMetrics = function(userMetrics){
        localStorage.setItem("userMetrics", JSON.stringify(userMetrics)); 
    }

    service.saveUserOptions = function(options){
        console.log('saving',options)
        //first, we need to get the relavant options
        var selected = _.map(options,function(val,key){
            return [key,val.selected];
        });
        console.log(JSON.stringify(selected))
        localStorage.setItem("userOptions", JSON.stringify(selected)); 
    }




    service.loadLifter = function(){
        //console.log('loaded lifter:'+localStorage.getItem("lifterID"))
        return localStorage.getItem("lifterID"); 
    }

    service.loadWeight = function(){
        var resp = localStorage.getItem("weight");
        if(resp==undefined){resp=135;}
        return parseFloat(resp); 
    }

    service.loadLiftType = function(){
        var resp = localStorage.getItem("liftType");
        if(resp==undefined){return undefined;}
        return JSON.parse(resp); 
    }
    service.loadMetricsDisplay = function(metricsDisplay){
        var resp = localStorage.getItem("metricsDisplay");
        if(resp==undefined){resp = {};}
        else{resp = JSON.parse(resp);}
        return _.extend(metricsDisplay,resp);

    }
    service.loadUserMetrics = function(){
        var resp = localStorage.getItem("userMetrics");
        if(resp==undefined){return {};}
        try {
            return JSON.parse(resp);
        } catch (e) {
            return {};
        }

        
    }
    service.loadUserOptions = function(options){
        //console.log('loading options')
        var resp = localStorage.getItem("userOptions");
        //console.log(JSON.parse(resp))
        if(resp!=undefined){
            _.each(JSON.parse(resp),function(opt){
                if(_.has(options,opt[0])){
                    options[opt[0]].selected = opt[1];
                }
            });
        }
        return options;
    }


    service.loadPreferences = function(){
        var lifterID = service.loadLifter();
        FormEditState.restoreSavedLifter(lifterID);
        FormEditState.setWeight(service.loadWeight(),true);
        FormEditState.setLiftType(service.loadLiftType());
        fs.metricsDisplay = service.loadMetricsDisplay(fs.metricsDisplay);
        fs.userMetrics = service.loadUserMetrics();
        fs.options = service.loadUserOptions(fs.options);
        console.log('loaded preferences');
        
        //console.log(this.metricsDisplay);
    }



    //now set up some times to automatically save things
    $rootScope.$on('weightChanged', function (event, data) {
        service.saveWeight(data.weight);
    });
    $rootScope.$on('liftTypeChanged', function (event, data) {
        service.saveLiftType(data.liftType);
    });
    $rootScope.$on('lifterChanged', function (event, data) {
        service.saveLifter(data.lifter);
    });
    $rootScope.$on('metricChanged', function (event, data) {
        service.saveMetricsDisplay(data.metricsDisplay);
    });
    $rootScope.$on('userMetricsChanged', function (event, data) {
        service.saveUserMetrics(data.userMetrics);
    });
    $rootScope.$on('optionsChanged', function (event, data) {
        service.saveUserOptions(fs.options);
    });

    return service;
}]);



