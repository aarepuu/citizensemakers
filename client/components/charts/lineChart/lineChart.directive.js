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
          var pathClass = "line";
          var xScale, yScale, xAxisGen, yAxisGen, line, path, color, zoom;

          var rawSvg = element.find('svg');
          var svg = d3.select(rawSvg[0])
            .attr("xmlns", "http://www.w3.org/2000/svg");

          xScale = d3.time.scale()
            //.domain([xMin, xMax])
            .range([padding + 5, rawSvg.attr("width") - padding]);


          yScale = d3.scale.linear()
            //.domain([yMin, yMax])
            .range([rawSvg.attr("height") - padding, 0]);


          xAxisGen = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .tickSize(-(rawSvg.attr("height") - padding), 0)
            .tickPadding(6);


          yAxisGen = d3.svg.axis()
            .scale(yScale)
            .orient("right")
            .tickSize(-(rawSvg.attr("width")))
            .tickPadding(6);

          color = d3.scale.category10();
          zoom = d3.behavior.zoom()
            .on("zoom", draw);


          //Render graph based on 'data'
          scope.render = function (data) {
            //proccess data
            data.forEach(function (d) {
              d.time = new Date(d.time * 1000);
            });

            color.domain(d3.keys(data[0]).filter(function (key) {
              return key !== "time";
            }));

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
            svg.selectAll('path').remove();

            //Render X axis
            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0,180)")
            //.call(xAxisGen);

            //Render Y axis
            svg.append("g")
              .attr("class", "y axis")
              .attr("transform", "translate(20,0)")
            //.append("text")
            //.attr("y", 6)
            //.attr("dy", ".71em")
            //.style("text-anchor", "end")
            //.text("Count")
            //.call(yAxisGen);

            //Create or update the path
            line = d3.svg.line()
              .x(function (d) {
                return xScale(d.time);
              })
              .y(function (d) {
                return yScale(d.value);
              })
              .interpolate(scope.interpolate);


            //TODO - better system of loading
            path = svg.append("path")
              /*.attr({
               d: line(data),
               "stroke": "#009688",
               "stroke-width": 2,
               "fill": "none",
               "class": pathClass
               });*/
              .attr("class", pathClass)
              .attr("clip-path", "url(#clip)");

            svg.append("rect")
              .attr("class", "pane")
              .attr("width", rawSvg.attr("width") - padding)
              .attr("height", rawSvg.attr("height") - padding)
              .call(zoom);

            zoom.x(xScale);
            svg.select("path.line").data([data]);
            draw();


          };

          function draw() {
            svg.select("g.x.axis").call(xAxisGen);
            svg.select("g.y.axis").call(yAxisGen);
            //console.log(svg.select("path.line").attr("d"));
            svg.select("path.line").attr("d", line);

            //animations
            /*var totalLength = path.node().getTotalLength();
             path
             .attr("stroke-dasharray", totalLength + " " + totalLength)
             .attr("stroke-dashoffset", totalLength)
             .transition()
             .duration(1000)
             .ease("linear")
             .attr("stroke-dashoffset", 0);*/
          }

          d3.select(window)
            .on("scroll.scroller", log);

          function log() {
            console.log("scrolling");
          }

          //Watch 'data' and run scope.render(newVal) whenever it changes
          //Use true for 'objectEquality' property so comparisons are done on equality and not reference
          scope.$watch('data', function (newVal, oldVal) {
            if (oldVal.length > 1)
              console.log(oldVal[0].user);
            scope.render(newVal);
          });

        });
      }
    };
  }]);

