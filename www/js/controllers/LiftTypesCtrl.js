var app = angular.module("form");

app.controller('LiftTypesCtrl' ,['$scope','FormState','FormEditState', 'FormGlobals' , 
    function($scope, FormState, FormEditState,FormGlobals){
    $scope.s = FormState;
    $scope.g = FormGlobals;
   
    //FormState.liftType = null;

    $scope.setSelected = function(liftType){
        FormEditState.setLiftType(liftType);
        
        if(_.findWhere(FormGlobals.liftTypes,{'parent':FormState.liftType.id})==undefined ){
            FormState.goHome();
        }

        //console.log('set to'+num)
    };    
    
    $scope.clearLiftType = function($event){
        $event.stopPropagation();
        //console.log('boom');
        FormState.liftType = null;
        //console.log('set to'+num)
    };

    $scope.showBackCover = function(liftType){
        if(FormState.liftType==null){
            return false;
        }

        if(liftType.parent==undefined && liftType.id == FormState.liftType.id){
             if(_.findWhere(FormGlobals.liftTypes,{'parent':FormState.liftType.id})==undefined ){
                return false;
            }
            return true;
        }
        if(FormState.liftType.parent == liftType.id){
            return true;
        }
        else{return false;}
    }

    $scope.showThisType = function(liftType){
        //first, get the lift type
        //console.log(liftType.name+':'+FormState.liftType);

        //Then, if no parent and no lift selected
        if(liftType.parent==undefined && FormState.liftType==null){
            return true;
        }else if(FormState.liftType==null){
            return false;
        }

        if(liftType.parent==FormState.liftType.id){
            return true;
        }

        if(liftType.id==FormState.liftType.id){
            return true;
        }

        //if the selected lift has no children, do display like its parent
        if(_.findWhere(FormGlobals.liftTypes,{'parent':FormState.liftType.id})==undefined ){
            if(liftType.parent==FormState.liftType.parent){
                return true;
            }
            if(liftType.id==FormState.liftType.parent){
                return true;
            }
        }
        return false;
    }; 

}]);