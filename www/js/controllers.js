var app = angular.module('twc.controllers', []);

app.controller('PassportCtrl', function($scope,$cordovaGeolocation,$ionicPopup,$ionicAnalytics,
                                        State,Globals) {
    $scope.s = State;
    $scope.m = {
        game : State.getCurrentGame()
       
    }



    $scope.addPoint = function(player){
        var score = State.games[State.currentGame].score[State.games[State.currentGame].score.length-1];
        if(player==0){
            State.games[State.currentGame].score.push([score[0]+1,score[1]])
        }else{
            State.games[State.currentGame].score.push([score[0],score[1]+1])
        }
        $scope.$broadcast('change', {});
    }
        
   $scope.toggleTable = function(){ 
        if(State.games[State.currentGame].played=='Garage'){
            State.games[State.currentGame].played = 'Main Room';
        }else{
            State.games[State.currentGame].played = 'Garage';
        }
   }

    $scope.toggleServed = function(){ 
        if(State.games[State.currentGame].servedFirst==0){
            State.games[State.currentGame].servedFirst = 1;
        }else{
            State.games[State.currentGame].servedFirst = 0;
        }
   }

});

app.controller('ScanCtrl', function($scope,$state,$cordovaBarcodeScanner,$ionicAnalytics,State) {
    $scope.s = State;
    $scope.m = {
      }



});

app.controller('LandingCtrl', function($scope,$state,$ionicAnalytics,State) {
    $scope.s = State;
    $scope.m = {
      }

      $scope.setleague = function(league){
        State.currentLeague = league._id;
        console.log(league)
        $state.go('tab.feed');
      }


});

app.controller('EditCtrl', function($scope,$state,$timeout,State,Globals) {
    $scope.s = State;
    $scope.m = {
        uploadIdx : 0
    }

    
});

app.controller('FeedDetailCtrl', function($scope,$state, $stateParams,State) {
    $scope.s = State;
     console.log('feed detail',$stateParams.feedId)
     $scope.name =$stateParams.feedId;



})

app.controller('BoxFeedCtrl', function($scope,State) {
    $scope.s = State;
});

app.controller('FeedCtrl', ['$scope','State','$ionicSideMenuDelegate', function($scope,State,$ionicSideMenuDelegate) {
    $scope.s = State;
    $scope.m = {
        
    }

  
    $scope.$on('$ionicView.afterEnter', function() {
        State.calcSeason();
    })


}]);

app.controller('TestCtrl', function($scope,Chats) {
     console.log('test')

//
});


app.controller('DirectoryCtrl', function($scope,$timeout, $ionicPopup,State,Games) {

    $scope.s = State;
    $scope.m = {
        
    }


    $scope.$on('$ionicView.beforeEnter', function() {
        //State.calcSeason();
        
    })

    $scope.addGames = function() {
        //we will use this for bulk upload of games
        
        State.loadGames();

        _.each(State.games,function(game,idx){
            
            //console.log('doing this ',game);
            $timeout(function(){
                //console.log('doing this ',game,idx)
                Games.createGame(game);
            },1000*idx);
            

        });

       
        //console.log(State.games[0])
        //console.log(g)
    }


    $scope.addGame = function() {
        $scope.data = {date:new Date()}

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: 'Date: <input type="date" ng-model="data.date"><br>Type: '+
                'Player 1: <select ng-model="data.player1"><option ng-repeat="team in s.teams | orderBy:s.getWins" value="{{team.name}}">{{team.name}}</option></select><br>'+
                'Player 2:<select ng-model="data.player2"><option ng-repeat="team in s.teams | orderBy:s.getWins" value="{{team.name}}">{{team.name}}</option></select>',
            title: 'New Game',
            subTitle: '',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.data.date || !$scope.data.player1 || !$scope.data.player2) {
                    //don't allow the user to close unless he enters name password
                    
                    e.preventDefault();
                  } else {
                    return {date:$scope.data.date,player1:$scope.data.player1,player2:$scope.data.player2};
                  }
                }
              }
            ]
        });
        myPopup.then(function(res) {
            if(!res){return;}
            console.log('Tapped!', res);

            State.games.push({
                id:State.games.length,
                players : [res.player1, res.player2 ],
                score:[[0,0]],
                played: 'Main Room',
                servedFirst: 0,
                gameIdx : 0,
                datePlayed: res.date,
                ratingChange:[0,0],
            })
            //$scope.m.markers.push({x:$scope.m.pos[0],y:$scope.m.pos[1],name:res.name,type:res.type,pct:_.random(60,100) })
            //console.log($scope.m.pos[0],$scope.m.pos[1])
            //$scope.$broadcast('addMarker');
        });
    }

    
    


});

