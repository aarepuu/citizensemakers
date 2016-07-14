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

          var padding = 25;
          var pathClass = "line";
          var xScale, yScale, xAxisGen, yAxisGen, line, path, color, zoom;
          var users = [];
          var values = [];

          var rawSvg = element.find('svg');
          var svg = d3.select(rawSvg[0])
            .attr("xmlns", "http://www.w3.org/2000/svg");

          xScale = d3.time.scale()
            .range([padding + 5, rawSvg.attr("width") - padding]);


          yScale = d3.scale.linear()
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

          //Create or update the path
          line = d3.svg.line()
            .x(function (d) {
              return xScale(d.time);
            })
            .y(function (d) {
              return yScale(d.value);
            })
            .interpolate(scope.interpolate);

          //Render graph based on 'data'
          scope.render = function (data) {
            //Sort done in backend
            //data.sort(function(a,b) {return b.time-a.time;});
            //proccess data
            data.forEach(function (d) {
              //console.log(d.time)
              d.time = new Date(d.time * 1000);
            });

            //Create map
            //users = [];
            //console.log(values);
            users.push(data[data.length - 1].user)
            color.domain(users);
            //values.push(data);
            console.log(users);
            values.push(data);
            //console.log(values);
            var datas = color.domain().map(function (user, i) {
              return {
                user: user,
                values: values[i]
              };
            });
            console.log(datas);
            //Set our scale's domains
            xScale.domain(d3.extent(data, function (d) {
              return d.time;
            }));

            yScale.domain([
              d3.min(datas, function (c) {
                return d3.min(c.values, function (v) {
                  return v.value;
                });
              }),
              d3.max(datas, function (c) {
                return d3.max(c.values, function (v) {
                  return v.value;
                });
              })
            ]);


            //Remove the axes so we can draw updated ones
            svg.selectAll('g.axis').remove();
            svg.selectAll('path').remove();
            svg.selectAll('text').remove();
            svg.selectAll('rect').remove();
            svg.selectAll(".user").remove();


            //Render X axis
            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0,180)");
            //.call(xAxisGen);


            //Render Y axis
            svg.append("g")
              .attr("class", "y axis")
              .attr("transform", "translate(20,0)")
              //.call(yAxisGen)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Beats per minute");


            //console.log(svg.selectAll(".user"))

            var user = svg.selectAll(".user")
              .data(datas)
              .enter().append("g")
              .attr("class", "user");

            /*var user = svg.append("g")
             .data(datas)
             .attr("class", "user");*/

            user.append("path")
              .attr("class", "line")
              /*.attr("d", function (d) {
               return line(d.values);
               })*/
              .attr("clip-path", "url(#clip)")
              .style("stroke", function (d) {
                return color(d.user);
              });

            //console.log(svg);
            //TODO - better system of loading
            /*path = svg.append("path")
             .attr({
             d: line(data),
             "stroke": "#009688",
             "stroke-width": 2,
             "fill": "none",
             "class": pathClass
             });
             .attr("class", pathClass)
             .attr("clip-path", "url(#clip)");*/

            user.append("text")
              .datum(function (d) {
                return {user: d.user, value: d.values[d.values.length - 1]};
              })
              .attr("transform", function (d) {
                return "translate(" + xScale(d.value.time) + "," + yScale(d.value.value) + ")";
              })
              .attr("x", 3)
              .attr("dy", ".35em")
              .text(function (d) {
                return d.user;
              });

            svg.append("rect")
              .attr("class", "pane")
              .attr("width", rawSvg.attr("width") - padding)
              .attr("height", rawSvg.attr("height") - padding)
              .call(zoom);

            zoom.x(xScale);
            //svg.select("path.line").data([data]);
            draw();


          };

          function draw() {
            svg.select("g.x.axis").call(xAxisGen);
            svg.select("g.y.axis").call(yAxisGen);
            //console.log(svg.select("path.line").attr("d"));
            //svg.select("path.line").attr("d", line);
            //console.log(svg.select("path.line"));
            var path = svg.selectAll("path.line").attr("d", function (d) {
              //console.log(d.values);
              return line(d.values);
            });
            console.log(svg.selectAll(".user"));
            //animations
            /*var totalLength = path.node().getTotalLength();
            path
              .attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
              .duration(2000)
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
            //console.log(newVal);
            //if (oldVal.length > 0) {
            //values.concat(oldVal);
            //}
            //reset
            if (newVal === null) {
              users = [];
              values = [];
            } else {
              if (newVal.length > 0) {
                scope.render(newVal);
              }
            }

          });

        });
      }
    };
  }]);

