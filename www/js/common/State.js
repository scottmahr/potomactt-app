//This is for all the configuration we need
var app = angular.module("twc");



//FormState should be all the state variables we will care about
//Anything that is used around app should be here
//There will be other factories that will manipulate this data
app.factory('State', ['$state','$timeout','$location','$cordovaGeolocation','$ionicAnalytics','$cordovaToast','Globals',
                function($state,$timeout,$location,$cordovaGeolocation,$ionicAnalytics,$cordovaToast,Globals) {
    //up here are private variables
    var dt = new Date();
    
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
        
    $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
            servicemyLat  = position.coords.latitude;
            servicemyLong = position.coords.longitude;

            $ionicAnalytics.setGlobalProperties({
              myLat: ''+servicemyLat,
              myLong: ''+servicemyLong,
            });

            $ionicAnalytics.track('App Use', {});
            }, function(err) {
            // error
        });
    
    var fakeScoreline = function(finalScore){
        var scores = [];
        var cScore = [0,0];
        var i = 0;
        while(i<100){
            i++
            scores.push([cScore[0],cScore[1]]);
            if(cScore[0]==finalScore[0] && cScore[1]==finalScore[1]){
                return scores;
            }

            if(cScore[0]==finalScore[0]){
                cScore[1]++;
            }
            else if(cScore[1]==finalScore[1]){
                cScore[0]++;
            }else{
                cScore[_.random(1)]++;
            }
            //console.log(cScore)
            //console.log(scores)

        }

    }

    //console.log(JSON.stringify(fakeScoreline([21,12])))
        
    var playersNames = ['Steve','Scott','Joe','Feeney','James','Tim','Corey','Matt','Gary','Peter','Cedar','Alex','Seth','Jeanine','Andy','AJ','Cubby','Emma','Keegan','Spike','Sam','Mike','Connie','Thies'];

    //now, get the games figured out

    var today = new Date('10-15-2014');
    var tomorrow = new Date(today);
    var gameID = 0;

    //team1,team2,score1,score2,field,game,date




    //console.log('this many games',games.length)

    var service =  {
        tables : ['Garage','Main Room'],
        leagues:[],
        teams: [],
        games: [],

        currentGame: undefined,
        currentLeague: '5637aac1ef0bfb03002ed188',  //this is the ID of the current league


    }

     service.pickGame = function(game){
        service.currentGame = game._id;
        //console.log('going to :',id);
        $state.go('tab.passport');
     }

    service.addTeam = function(name){
        service.teams.push({name:name})
    }

    service.getCurrentGame = function(){
        return _.findWhere(service.games,{'_id':service.currentGame});

    }

    service.getRecord = function(playerID){
        var won=0;
        var lost = 0;
        var tie = 0;
        var pDif = 0;
        _.each(service.games,function(game){
            pDif = game.scores[game.scores.length-1][0]-game.scores[game.scores.length-1][1];
            if(game.player1==playerID && pDif>0){won++;}
            else if(game.player1==playerID && pDif<0){lost++;}
            else if(game.player2==playerID && pDif<0){won++;}
            else if(game.player2==playerID && pDif>0){lost++;}
            else if( (game.player1==playerID || game.player2==playerID) && pDif==0){tie++;}
        })
        return [won,lost,tie];
    }
    service.getWins = function(team){
        return -team.rating;
        var record = service.getRecord(team._id);
        return -record[0]+record[1];
    }

    service.getRecordStr = function(playerID){
        var record = service.getRecord(playerID);
        return record[0]+'-'+record[1]+'-'+record[2];
    }
    

    service.getGames = function(playerID){
        var games = [];

        _.each(service.games,function(game){
            if(game.player1==playerID){
                game.cPlayer = 0;
                games.push(game);
            }else if(game.player2==playerID){
                game.cPlayer = 1;
                games.push(game);
            }
        })
        return games;
    }
   


    service.toast = function(msg){
        return;
        if(window.cordova && $cordovaToast){
            $cordovaToast
                .show(msg, 'short', 'top')
                .then(function(success) {
                    // success
                }, function (error) {
                    // error
                });
        }
    };

   



    service.gameX = function(wScore,lScore){
      var r = lScore/(wScore-1); 
      var x =   125 + 475 * Math.sin(_.min([1,(1-r)/.5])*.4*3.1414)/Math.sin(.4*3.1415);
      if(x>600){return 600;}
      return parseInt(x);
    }

    service.getPlayerID = function(name){
      name = name.toLowerCase();

      var team = _.findWhere(service.teams,{'name':name});
      if(team){return team._id;}

      var found = '';
      //now see if we have any partial matches
      _.each(service.teams,function(team){
            if(team.name.indexOf(name)!=-1){
                console.log('found match',name)
                found = team._id;
            }
      });

      if(found==''){console.log('error',name);}
      return found;
    }

    service.getPlayerName = function(id){
      var team = _.findWhere(service.teams,{'_id':id});
      if(team){return team.name;}
      //console.log('error',id);
      return '';
    }

    service.getRating = function(id){
      var team = _.findWhere(service.teams,{'_id':id});
      if(_.has(team,'rating')){return team.rating;}
      return 1000;
    }



    service.playGames = function(){
        //console.log('playing games');
        var updatedTeams = _.map(service.teams,function(team){
            //look through all games and get scores for games they played in
            var scores = [];
            var bestGame = [];  //score, opponent(score)
            var worstGame = []; //score, opponent(score)
            var x,opp;

            _.each(service.games,function(g){
              if(!_.has(g,'ratingChange')){g.ratingChange=[0,0];}
              x = undefined;
              if(g.player1==team._id){
                //They were the winner
                x = service.gameX(g.scores[g.scores.length-1][0],g.scores[g.scores.length-1][1]);
                rating = service.getRating(g.player2)+x;
                g.ratingChange[0] = rating-service.getRating(g.player1);
                opp = g.player2+'-Win';
                
              }
              if(g.player2==team._id){
                //They were the loser
                x = service.gameX(g.scores[g.scores.length-1][0],g.scores[g.scores.length-1][1]);
                rating = service.getRating(g.player1)-x;
                g.ratingChange[1] = rating-service.getRating(g.player2);
                opp = g.player1+'-Loss';
              }

              if(x!=undefined){
                scores.push(rating);

                if(bestGame.length==0 || rating>bestGame[0]){
                  //new best win
                  bestGame = [rating,opp+'('+g.scores[g.scores.length-1][0]+'-'+g.scores[g.scores.length-1][1]+')'];
                }
                if(worstGame.length==0 || rating<worstGame[0]){
                  //new best win
                  worstGame = [rating,opp+'('+g.scores[g.scores.length-1][0]+'-'+g.scores[g.scores.length-1][1]+')'];
                }

              }


          });

        //console.log(team.name+':'+JSON.stringify(scores));
        var newScore = Globals.myAverage(scores).mean;
        if(scores.length==0){newScore=1000;}
        return {'_id':team._id,'rating':newScore,'bestGame':bestGame,'worstGame':worstGame}
      });

      //now we go through and update the team scores so we can run it again
      _.each(updatedTeams,function(team){
            var t = _.findWhere(service.teams,{'_id':team._id});
            t.rating = team.rating;
            t.bestGame = team.bestGame;
            t.worstGame = team.worstGame;
      })

      //console.log(_.pluck(service.teams,'name'));
      //console.log(_.pluck(service.teams,'rating'));
      //console.log('')
    }



    service.calcSeason = function(){
        console.log('starting calc')
      _.each(_.range(30),function(){service.playGames();});
      service.seassonStatistics();
      var sortedPlayers = _.sortBy(service.teams,'rating').reverse()
      _.each(sortedPlayers,function(p){
        //console.log(JSON.stringify(p));
        //console.log(p.name+':'+parseInt(p.rating)+':'+parseInt(p.sOfs)+':'+p.gamesWon+':'+p.gamesLost+':'+parseInt(p.bestGame[0])+':'+p.bestGame[1]+':'+parseInt(p.worstGame[0])+':'+p.worstGame[1]);
      });
        //console.log(JSON.stringify(players));
    }

    service.seassonStatistics = function(){
      var updatedTeams = _.map(service.teams,function(team){
        //look through all games and get scores for games they played in
        var oppRatings = [];
        var gWon=0,gLost=0;
        _.each(service.games,function(g){
          if(g.player1==team._id){
            oppRatings.push(service.getRating(g.player2));
            gWon++;
          }
          if(g.player2==team._id){
            oppRatings.push(service.getRating(g.player1));
            gLost++;
          }
        

          x = undefined;
          if(g.player1==team._id){
            //They were the winner
            x = service.gameX(g.scores[g.scores.length-1][0],g.scores[g.scores.length-1][1]);
            rating = service.getRating(g.player2)+x;
            opp = g.player2+'-Win';
            //console.log(team._id+'('+g.scores[g.scores.length-1][0]+')'+','+g.player2+'('+g.scores[g.scores.length-1][1]+')'+','+rating);
            
          }
          if(g.player2==team._id){
            //They were the loser
            x = service.gameX(g.scores[g.scores.length-1][0],g.scores[g.scores.length-1][1]);
            rating = service.getRating(g.player1)-x;
            opp = g.player1+'-Loss';
            //console.log(team._id+'('+g.scores[g.scores.length-1][1]+')'+','+g.player1+'('+g.scores[g.scores.length-1][0]+')'+','+rating);
          }

        });

        team['sOfs']=Globals.myAverage(oppRatings).mean;
        team['gamesWon']=gWon;
        team['gamesLost']=gLost;

        //console.log(team)


        return team;
      });
      service.teams = updatedTeams;
    }
    


    service.loadGames = function(){
        _.each(Globals.games,function(g,idx){
            //now we look at each game in the day
         
            //console.log(parseInt(idx*90/25),tomorrow)

           
            var game = {
                datePlayed:  new Date(g[6]), 
                leagueID:  '5637aa91ef0bfb03002ed187',
                player1: service.getPlayerID(g[0]), 
                player2: service.getPlayerID(g[1]),
                scores: fakeScoreline([g[2], g[3]]),  //scores [[0,1],[1,2],[2,2],[0,0],[1,1],[2,3]]
                properties: { game:g[5] }, //who served first, anything like that 
                location: g[4]
            };


            service.games.push(game);



            //console.log(g[0]+','+g[1]+','+g[2]+','+g[3]+','+g[0])
            
        });

        console.log(service.games)


    }






    return service;

}]);








   





