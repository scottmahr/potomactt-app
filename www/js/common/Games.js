//This is for all the configuration we need
var app = angular.module("twc");

//FormMetrics has all of the methods that will deal with metrics
app.factory('Games', ['$rootScope','Restangular', 'State' ,
            function($rootScope, Restangular, State) {

    //Setting up box stuff
    var gamesBase = Restangular.all('games');
    var gamesList =  gamesBase.getList();
    
    gamesList.then(function(gamesResult) {
        console.log("Got Games:"+gamesResult.length)
        State.games = gamesResult;
    },function(error) {
        console.log("error"+error)
    } );


    var service = {};

    //this is the private delete game function
    service.deleteGame = function(game){
        game.remove().then(function(){
            State.games = _.filter(State.games, function(u){return u._id != game._id;});
            if(State.selectedGame._id==game._id){
                State.selectedGame = undefined;
            }
            State.toast('Game deleted')
        },function(){
            State.toast('Error deleting game')
            console.log('error deleting game');
        });
        
    }

    //this is the private update game function
    service.updateGame = function(game, updates){
        _.each(updates,function(v,k){
            game[k] = v;
        });

        game.put().then(function(){
            console.log('game updated');
            State.toast('Game updated')
        },function(){
            console.log('error updating game');
            State.toast('Error updatiung game')
        });
    };

    //this is the private create game
    service.createGame = function(game){
        gamesBase.post(game).then(function(game){
            console.log(JSON.stringify(game));
            //State.games.push(game);
            //console.log("we have this many games now:"+State.games.length)
        },function(){
            console.log('error in the create game post');
        });
    }



    


    return service;
}]);

