var app = angular.module("form");



app.controller('EditMetricCtrl' , ['$scope', 'FormState', 'FormGlobals','FormMetrics', 
                    function($scope, FormState, FormGlobals,FormMetrics){

    $scope.s = FormState;
    $scope.g = FormGlobals;

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.m = {
            metric:undefined,
            metricIdx: FormState.metricEdit,
            showDesc: false,
        };
        if(!!FormState.lifts[FormState.selectedLift]){
            $scope.m.liftTypeID = FormState.lifts[FormState.selectedLift].liftType;
        }else{
            $scope.m.liftTypeID = FormState.liftType.id;
        }
        $scope.m.parentLiftTypeID = FormGlobals.liftTypeParent($scope.m.liftTypeID)
        $scope.setMetric();
        $scope.showDescription();
     // Code you want executed every time view is opened
       console.log('Opened edit metric')
    })
   

    //gets the current metric we are editing
    $scope.setMetric = function(metric){
      console.log('setMetric',metric);

      if(metric==undefined){
        //if we don't pass in a metric, we need to get the current one
        $scope.m.metric = FormMetrics.getMetricForIdx($scope.m.metricIdx,$scope.m.liftTypeID);
        console.log('updated metric'+JSON.stringify($scope.m.metric))
      }else if(metric==false){
        //this means we are trying to clear the metric
        $scope.m.metric = false;
        //console.log('we set it to null')
      }else{
        //save the metric
        $scope.m.metric = metric;
        FormMetrics.changeMetric($scope.m.metricIdx,metric.key,$scope.m.liftTypeID)
        //console.log('metric',FormState.metricEdit,metric.key);
        if($scope.m.metricIdx>0 || _.has(metric,'session')){
            $scope.s.goHome();
        }
      }
      $scope.showDescription();
    };

    $scope.showDescription = function(){
        //console.log($scope.m.metric)
        //if we don't have a metric
        if(!$scope.m.metric || _.has($scope.m.metric,'session') || $scope.m.metricIdx>0){
            $scope.m.showDesc = false;
        }else{
            $scope.m.showDesc = true;
        }
        //console.log($scope.m.showDesc)
    }



    $scope.setSound = function(rangeIdx){
        if(!_.has($scope.m.metric,'sounds')){
            $scope.m.metric.sounds = ['','',''];
        }

        var currentSoundIdx = _.findIndex(FormState.sounds,function(s){
            return s.name== $scope.m.metric.sounds[rangeIdx];
        });

        if(currentSoundIdx==undefined){currentSoundIdx=0;}
        var newSoundIdx = (currentSoundIdx+1+FormState.sounds.length)%FormState.sounds.length;

        $scope.m.metric.sounds[rangeIdx] = FormState.sounds[newSoundIdx].name;
        FormState.playSound(FormState.sounds[newSoundIdx].name);

        FormMetrics.setCustomMetric($scope.m.metric.key,{'sounds':$scope.m.metric.sounds});
    };

    $scope.resetDefaults = function(){
        console.log('resetting to defaults')
        FormState.resetDefaults($scope.m.metric.key);
        $scope.setMetric();

    };

    if(FormState.metricEdit==undefined){
        //we aren't ready for this, send us back home
        FormState.goHome();
    }
    


//

}]);


app.filter('showMetrics', function() {
    return function( items, liftTypeID, parentID,idx ) {
        if(liftTypeID==undefined){return [];}
        //console.log('showMetrics',items);
        //console.log('liftype',liftTypeID);
        var filtered = [];
        _.each(items, function(item) {
            if(_.has(item,'simple')){
                if( _.contains(item.liftTypes,liftTypeID) || _.contains(item.liftTypes,parentID)) {
                  filtered.push(item);
                }
            }else if(_.has(item,'live')){
                filtered.push(item);
            }else if(_.has(item,'session')){
                  filtered.push(item);
            }
        });
      return filtered;
    };
});