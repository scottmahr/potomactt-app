//This is for all the configuration we need
var app = angular.module("twc");

//FormMetrics has all of the methods that will deal with metrics
app.factory('Teams', ['Restangular', 'State'  ,
            function(Restangular, State) {

     //Setting up team stuff
    var teamsBase = Restangular.all('teams');
    
    
    

    var service = {};

    service.getTeams = function(){
        var teamsList =  teamsBase.getList();
        teamsList.then(function(teamsResult) {
            console.log("Got teams:"+teamsResult.length)
            State.teams = teamsResult;
            //EditState.updateNearGyms();
            },function(error) {
                console.log("error"+error)
        } );
    };


    //this is the private delete team function
    service.deleteTeam = function(team){
        console.log('deleting:',team)
        team.remove().then(function(){
            State.teams = _.filter(State.teams, function(u){return u._id != team._id;});
            
            State.toast('team deleted')
        },function(){
            State.toast('Error deleting team')
            console.log('error deleting team');
        });
        
    }

    //this is the private update team function
    service.updateTeam = function(team, updates){
        _.each(updates,function(v,k){
            team[k] = v;
        });

        team.put().then(function(){
            console.log('team updated');
            State.toast('team updated')
        },function(){
            console.log('error updating team');
            State.toast('Error updatiung team')
        });
    };

    //this is the private create team
    service.createTeam = function(team){
        teamsBase.post(team).then(function(team){
            if(_.has(team,'error')){
                console.log('error in the create team post:'+JSON.stringify(team));
            }else{
                console.log(JSON.stringify(team));
                State.teams.push(team);
                console.log("we have this many teams now:"+State.teams.length)
            }
            
        },function(err){
            console.log('error in the create team post:'+JSON.stringify(err));
        });
    }



    
    service.getTeams();

    return service;
}]);

