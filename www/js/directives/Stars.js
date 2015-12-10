var app = angular.module("twc");


app.directive('stars',['State',  function(  State) {
  return {
    restrict: 'A',
    scope: {
        edit : '@edit',
        filled : '@filled',
        w : '@w',
        h : '@h'
    },
    replace:true,
    template: '<div class="stars"></div>',
    link: function(scope, ele, attrs) {

        State.stars = 3;

        //console.log(scope.filled,scope.edit)

        if(scope.filled == -1){
            scope.filled = State.stars;
        }
        scope.w = parseInt(scope.w);
        scope.h = parseInt(scope.h);


        var svg = d3.select(ele[0]).append('svg')
           .attr('width', scope.w)
           .attr('height', scope.h)
           .append("g");
          


        var starsSvg;




        scope.init = function(){
            //console.log('init',scope.filled)

            starsSvg = svg.selectAll("path")
                .data(_.range(5))
                .enter()
                .append("path")
                .attr("d", function (d) { 
                    return starDwg(scope.h/2+scope.h*d,scope.h/2,scope.h*.8); 
                })
                .attr("fill",function(d){
                    if(d<scope.filled){return '#FFC900';}
                    else{return '#888888';}
                })
                .on("click", function(d){
                    //console.log(scope.edit)

                    if(scope.edit=="true"){
                        //console.log('State.stars',d)
                        State.stars = d+1;
                        scope.filled = d+1;
                        scope.update();
                    }else{
                        //console.log('nope')
                    }
                    
                });
            
        }

        scope.update = function(){
            //console.log('update',State.stars)

            starsSvg
                .attr("fill",function(d){
                    if(d<scope.filled){return '#FFC900';}
                    else{return '#888888';}
                });
                
            
        }

        function starDwg(x, y, radius) {
            var a = .382*radius;
            var b = .236*radius;
            var r = .162*radius;
            var R = .2008*radius;
            var p = .5257*radius;
            var xx = .309*radius;
            var yy = .224*radius;
          return "M" + (x+0) + "," + (y-p)
               +  "L" + (x+b/2) + "," + (y-r)
               +  "L" + (x+b/2+a) + "," + (y-r)
               +  "L" + (x+R*.9) + "," + (y+.4*R)
               +  "L" + (x+xx) + "," + (y+R+yy)
               +  "L" + (x) + "," + (y+R)
               +  "L" + (x-xx) + "," + (y+R+yy)
               +  "L" + (x-R*.9) + "," + (y+.4*R)
               +  "L" + (x-b/2-a) + "," + (y-r)
               +  "L" + (x-b/2) + "," + (y-r)
               + "z";

        }

        scope.init();

    }
  }

}]);