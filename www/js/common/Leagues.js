//This is for all the configuration we need
var app = angular.module("twc");

//FormMetrics has all of the methods that will deal with metrics
app.factory('Leagues', ['Restangular', 'State'  ,
            function(Restangular, State) {

     //Setting up league stuff
    var leaguesBase = Restangular.all('leagues');
    var leaguesList =  leaguesBase.getList();
    
    leaguesList.then(function(leaguesResult) {
        console.log("Got leagues:"+leaguesResult.length)
        State.leagues = leaguesResult;
        //EditState.updateNearGyms();
    },function(error) {
        console.log("error"+error)
    } );

    var service = {};

    //this is the private delete league function
    service.deleteLeague = function(league){
        console.log('deleting:',league)
        league.remove().then(function(){
            State.leagues = _.filter(State.leagues, function(u){return u._id != league._id;});
            if(State.selectedLeague._id==league._id){
                State.selectedLeague = undefined;
            }
            State.toast('League deleted')
        },function(){
            State.toast('Error deleting league')
            console.log('error deleting league');
        });
        
    }

    //this is the private update league function
    service.updateLeague = function(league, updates){
        _.each(updates,function(v,k){
            league[k] = v;
        });

        league.put().then(function(){
            console.log('league updated');
            State.toast('League updated')
        },function(){
            console.log('error updating league');
            State.toast('Error updatiung league')
        });
    };

    //this is the private create league
    service.createLeague = function(league){
        leaguesBase.post(league).then(function(league){
            if(_.has(league,'error')){
                console.log('error in the create league post:'+JSON.stringify(league));
            }else{
                console.log(JSON.stringify(league));
                State.leagues.push(league);
                console.log("we have this many leagues now:"+State.leagues.length)
            }
            
        },function(err){
            console.log('error in the create league post:'+JSON.stringify(err));
        });
    }



    


    return service;
}]);

