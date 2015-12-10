//This is the plot we will use for our app
var app = angular.module("twc");


app.directive('scoreplot', ['$window','$timeout','State', function($window,$timeout,State) {
  return {
    restrict: 'A',
    replace:true,
    template: '<div class="scorePlot"></div>',
    link: function(scope, ele, attrs) {
        var margin = {top: 10, right: 10, bottom: 10, left: 10};

        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight|| e.clientHeight|| g.clientHeight;
        //So I'm able to fit my plot to the user's window like this :
        //console.log(x,y)

        w= x - margin.left - margin.right;
        h= 150;

        var svg = d3.select(ele[0]).append('svg')
            .attr('width', w + margin.left + margin.right)
            .attr('height', h + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
            
        //first, lets analyze everything


        var game = State.getCurrentGame();
        if(!game){return;}

        var points = [_.pluck(game.scores,0),_.pluck(game.scores,1)];
        console.log(points)

        var lineColors = ['#479e70','#2b85c2'];
        var fillColors = ['#64d996','#4fc5e3'];

        var text = [];

        var legendWidth = 5;
        var xAxisHeight = 5;

        
        var scales = { 'x': d3.scale.linear()
                    .domain([0,points[0].length-1])
                    .range([legendWidth,w]),
            'y': d3.scale.linear()
                    .domain( [0,21] )
                    .range([h-xAxisHeight, 0])
        };

        //Define X axis
        var xAxis = d3.svg.axis()
            .scale(scales.x)
            .orient("bottom")

            .tickFormat(function(d){return '';
            })
            .ticks(0);

        //Define Y axis
        var yAxis = d3.svg.axis()
          .scale(scales.y)
          .orient("left")
          .tickFormat(function(d){
            return '';
          })
          .ticks(0);


                
        var line = d3.svg.line()
            //.interpolate('basis-open')
            .interpolate('linear')
            .x(function(d,i) {
                return scales.x(i);
            })
            .y(function(d,i) {
                return scales.y(d);
            });


        

        //Create X axis
        svg.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(0," + (h-xAxisHeight ) + ")")
            .call(xAxis);
        
        //Create Y axis
        svg.append("g")
            .attr("class", "yaxis")
            .attr("transform", "translate(" + legendWidth + ",0)")
            .call(yAxis);


        
        var paths = _.map(_.range(2),function(){return svg.append('path')});


        var drawStuff = function(duration){

            points = [_.pluck(game.scores,0),_.pluck(game.scores,1)];

            scales = { 'x': d3.scale.linear()
                        .domain([0,points[0].length-1])
                        .range([legendWidth,w]),
                'y': d3.scale.linear()
                        .domain( [0,_.max(_.flatten(points))] )
                        .range([h-xAxisHeight, 0])
            };

            //Drawing the force line here   
            _.each(points,function(d,idx){

                paths[idx]
                    .datum(d)
                    .attr('d',line)
                    .attr("stroke", lineColors[idx])
                    .attr("stroke-width", '2px')
                    .attr("fill", 'none')
                    

                svg.selectAll(".mypoint"+idx).remove();

               
                svg.selectAll(".mypoint"+idx)
                    .data(d)
                  .enter().append("svg:circle")
                     .attr("class", "mypoint"+idx)
                     .attr("stroke", 'none')

                     .attr("fill", function(d, i) { return lineColors[idx] })
                     .attr("cx", function(d, i) { return scales.x(i) })
                     .attr("cy", function(d, i) { return scales.y(d) })
                     .attr("r", function(d, i) { return 3 });
            });
           
        }

        


      

        drawStuff(100);

        scope.$on('change',function(event,data){
            console.log('see change')
            drawStuff(1000);
        })
     
    }
  }
}]);