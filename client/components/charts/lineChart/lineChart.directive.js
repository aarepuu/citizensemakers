'use strict';

angular.module('charts')
  .directive('lineChart', ['d3Service', function (d3Service) {
    return {
      restrict: 'EA',
      template: "<svg width='850' height='200'></svg>",
      scope: {
        data: '=?',
        clicked: '&clicked',
        interpolate: '=?'
      },
      link: function (scope, element, attrs) {
        d3Service.d3().then(function (d3) {
          //var chartData = scope.data;
          var padding = 25;
          var pathClass = "path";
          var xScale, yScale, xAxisGen, yAxisGen, line;

          var rawSvg = element.find('svg');
          var svg = d3.select(rawSvg[0]);

          xScale = d3.time.scale()
            //.domain([xMin, xMax])
            .range([padding + 5, rawSvg.attr("width") - padding]);

          yScale = d3.scale.linear()
            //.domain([yMin, yMax])
            .range([rawSvg.attr("height") - padding, 0]);


          xAxisGen = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(20);

          yAxisGen = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(5);

          //Render graph based on 'data'
          scope.render = function (data) {
            //proccess data
            data.forEach(function (d) {
              d.time = new Date(d.time * 1000);
            });
            //get min and max
            //TODO - save time and sort already form the query from db
            var xMin = d3.min(data, function (d) {
              return Math.min(d.time);
            });
            var xMax = d3.max(data, function (d) {
              return Math.max(d.time);
            });

            var yMin = d3.min(data, function (d) {
              return Math.min(d.value);
            });
            var yMax = d3.max(data, function (d) {
              return Math.max(d.value);
            });
            //Set our scale's domains
            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);

            //Remove the axes so we can draw updated ones
           svg.selectAll('g.axis').remove();

            //Render X axis
            svg.append("svg:g")
              .attr("class", "x axis")
              .attr("transform", "translate(0,180)")
              .call(xAxisGen);

            //Render Y axis
            svg.append("svg:g")
              .attr("class", "y axis")
              .attr("transform", "translate(20,0)")
              //.append("text")
              //.attr("y", 6)
             //.attr("dy", ".71em")
              //.style("text-anchor", "end")
              //.text("Count")
              .call(yAxisGen);

            //Create or update the path
            line = d3.svg.line()
              .x(function (d) {
                return xScale(d.time);
              })
              .y(function (d) {
                return yScale(d.value);
              })
              .interpolate(scope.interpolate);

            svg.append("svg:path")
              .attr({
                d: line(data),
                "stroke": "blue",
                "stroke-width": 2,
                "fill": "none",
                "class": pathClass
              });


          };


          //Watch 'data' and run scope.render(newVal) whenever it changes
          //Use true for 'objectEquality' property so comparisons are done on equality and not reference
          scope.$watch('data', function (newVal) {
            //TODO - find a better way
            if(newVal === 'None') return;
            scope.render(newVal);
          });

        });
      }
    };
  }]);

