var app = angular.module("form");

app.service('FormUsers', ['FormState','FormEditState', function(FormState,FormEditState) {
var fs = FormState;

    var service = {};


    //log into facebook
    service.facebookLogin = function() {
        console.log("loggin in")
        facebookConnectPlugin.login(["public_profile"],
            function(response){
                console.log('logged in')
                service.getFacebookInfo();
            },
            function (error) { 
                console.log('error logging in:',error)
            }
        );
    };
    
    //this works if we are already logged into facebook, 
    //if we aren't logged in, it takesus there
    service.getFacebookInfo = function() {
        console.log("getting user")
        facebookConnectPlugin.api('/me?fields=picture.width(150).height(150),email,name,birthday', null,
            function(response) {
                fs.facebookUserInfo = response;
                fs.facebookID = response.id;
                fs.facebookPicture = response.picture.data.url;
                //console.log(JSON.stringify(response))
                service.setCurrentUser();
            },
            function(error){
                console.log('error from fb:',error)
                service.facebookLogin();
            }
        );
    };



    service.setCurrentUser = function(){
        //if we aren't logged on, do nothing
        if(fs.facebookID == ""){
            console.log('not logged into facebook');
            return;
        }
        FormEditState.restoreSavedLifter(undefined,fs.facebookID);


    }

    service.getFacebookFriends = function() {
        facebookConnectPlugin.api('/me/friends', ["user_friends"], 
            function(response) {
                fs.facebookFriends = response;
                //console.log(JSON.stringify(response))
                //this.friends = response.data;
                //$scope.$apply();
            },function (error) {
                console.log('couldnt get friends'+error);
            
            }
        );
    };

    service.checkFaceookStatus = function() {
        console.log("checking status")
        facebookConnectPlugin.getLoginStatus(
            function(response){
                fs.facebookLoginInfo = response;
                //console.log(JSON.stringify(response))
            },
            function (error) { 
                console.log('error gettings status:'+error)
            }
        );
    };


    return service;

}]);