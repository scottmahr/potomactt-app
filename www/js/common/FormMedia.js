//This is for all the configuration we need
var app = angular.module("form");

//FormMedia does all the work to play sounds and video
app.factory('FormMedia', ['FormState' ,function(FormState) {
    
    var sounds = [];
    var getMediaURL = function(s) {
        if(device.platform.toLowerCase() === "android") {return "/android_asset/www/" + s;}
        return s;
    }


    return {
        //loads all the sounds so we are ready to use them
        loadSounds : function(){
              sounds =  [
                  {name:''},
                  {name:'success', audio: new Media(getMediaURL('media/success.wav'))},
                  {name:'din-ding', audio: new Media(getMediaURL('media/din-ding.wav'))},
                  {name:'buzzer', audio: new Media(getMediaURL('media/buzzer.wav'))}
              ];

        },
        //plays a sound by name
        playSound : function(name){
            if(name==undefined){
                return;
            }
            var sound = _.findWhere(sounds,{name:name});
            if(sound!=undefined && _.has(sound,'audio')){
                console.log('playing sound...'+name)
                sound.audio.play();
            }
        }
    }
}]);

