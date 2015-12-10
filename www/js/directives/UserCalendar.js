var app = angular.module("twc");


app.directive('usercal', ['$window', 'State', 
                function($window, State) {
  return {
    restrict: 'A',
    scope: {},
    replace:true,
    template: '<div><table id="calendar" on-swipe-left="changeMonth(1)" on-swipe-right="changeMonth(-1)" ></table></div>',
    link: function(scope, ele, attrs) {
      ele.css({
       'width': '100%',
       'height': '51vh',
       'background-color': 'rgba(29,38,51,0.9)',
      });
      

      var w=parseInt($window.innerWidth);
      var h=parseInt(.51*$window.innerHeight);
      var vh = .01*$window.innerHeight;

      var sessions = FormState.daysWithLifts;


      var month = (new Date()).getMonth();
      var year = (new Date()).getFullYear();
      var cal = new Calendar();
      var weeks = cal.monthDays(year,month);


      var table = d3.select('#calendar')

     
      var header = table.append('thead');
      var body = table.append('tbody');

      var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      dayNames = ["S", "M", "T", "W", "T", "F", "S"];
      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUNE", "JULY", "AUG", "SEP", "OCT", "NOV", "DEC"];



      scope.update = function(){
        //console.log(JSON.stringify(sessions));

        weeks = cal.monthDays(year,month);
        
        header.html("");
        body.html("");


        header
        .append('tr')
        .append('td')
        .attr('colspan', 7)
        .style('color', 'white')
        .style('padding-top', '1vh')
        .style('font-weight', '900')
        .style('letter-spacing', '2px')
        .text(monthNames[month]+'    '+year);

        weeks.forEach(function (week) {
          body
            .append('tr')
            .selectAll('td')
            .data(week)
            .enter()
            .append('td')
            .style('text-align', 'center')
            .style('width', 4*vh+'px')
            .style('height', 4*vh+'px')
            .style('vertical-align', 'center')
            .style('color', 'white')
            .on('click', function(d,i){
                //console.log('yup')
                //check to see if anything happened then
               _.each(sessions,function(ses){
                    if(ses[0]==year && ses[1]==month && ses[2]==d){
                        FormEditState.setLiftingDay(year,month,d);
                        FormState.goHome();
                        //scope.update();
                    }
                });
            })
            .attr('class', function (d) {
                var cls = '';
                _.each(sessions,function(ses){
                    if(ses[0]==year && ses[1]==month && ses[2]==d){
                        cls = 'calLift';
                    }
               // console.log(year+":"+month+":"+d);
                });
                if(FormState.selectedDay[0]==year && FormState.selectedDay[1]==month && 
                      FormState.selectedDay[2]==d){
                    cls = 'calToday';
                }
              return cls;
            })
            .text(function (d) {
              return d > 0 ? d : '';
            });
        });

      }

      scope.update();
      scope.changeMonth = function(m){
        month += m;
        if(month>=12){year++;month-=12;}
        if(month<0){year--;month+=12;}
        scope.update();
        //console.log('changing month');
        //console.log(sessions);
        
      }


      scope.$on('lifterChanged', function (event, data) {
            sessions = data.daysWithLifts;
            scope.update();
      });
   
    }
  }
}]);