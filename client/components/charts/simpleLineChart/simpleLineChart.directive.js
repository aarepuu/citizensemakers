'use strict';

angular.module('charts')
  .directive('simpleLineChart', ['d3Service', '$filter', function (d3Service, $filter) {
    return {
      restrict: 'EA',
      template: "<svg width='960' height='500'></svg>",
      scope: {
        data: '=?',
        brushed: '&brushed',
        interpolate: '=?'
      },
      link: function (scope, element, attrs) {
        d3Service.d3().then(function (d3) {

          var margin = {top: 10, right: 10, bottom: 100, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

          var xScale, yScale, xAxisGen, yAxisGen, line, path, color, brush, content;
          var users = [];
          var datas = [];

          var rawSvg = element.find('svg');
          var svg = d3.select(rawSvg[0])
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

          xScale = d3.time.scale()
            .rangeRound([0, width]);

          yScale = d3.scale.linear()
            .rangeRound([height, 0]);


          xAxisGen = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .tickSize(-(width), 0)
            .tickPadding(6);

          yAxisGen = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .tickSize(-(width))
            .tickPadding(6);

          brush = d3.svg.brush()
            .x(xScale)
            .on("brush", brushed);

          color = d3.scale.category10();

          //Create or update the path
          line = d3.svg.line()
            .x(function (d) {
              return xScale(d.time);
            })
            .y(function (d) {
              return yScale(d.value);
            })
            .interpolate(scope.interpolate);


          content = svg.append("g")
            .attr("class", "content")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


          //Render graph based on 'data'
          scope.render = function (data) {

            //Check if we have to remove data
            var index = users.indexOf(data[data.length - 1].user);
            if (index != -1) {
              users.splice(index, 1);
              //TODO - make more generic
              datas = filterOut(datas, data[data.length - 1].user);

            } else {
              //proccess data
              data.forEach(function (d) {
                d.time = new Date(d.time * 1000);
              });

              users.push(data[data.length - 1].user)
              datas.push({user: data[data.length - 1].user, values: data});
            }

            color.domain(users);

            //Set our scale's domains
            xScale.domain([
              d3.min(datas, function (c) {
                return d3.min(c.values, function (v) {
                  return v.time;
                });
              }),
              d3.max(datas, function (c) {
                return d3.max(c.values, function (v) {
                  return v.time;
                });
              })
            ]);

            //console.log(xScale.domain());

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
            content.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
            //.attr("transform", "translate(0,180)");
            //.call(xAxisGen);


            //Render Y axis
            content.append("g")
              .attr("class", "y axis")
              //.attr("transform", "translate(20,0)")
              //.call(yAxisGen)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Beats per minute");


            var user = content.selectAll(".user")
              .data(datas)
              .enter().append("g")
              .attr("class", "user");


            user.append("path")
              .attr("class", "line")
              .attr("id", function (d) {
                return d.user;
              })
              .style("stroke", function (d) {
                return color(d.user);
              });

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


            //add brush
            content.append("g")
              .attr("class", "x brush")
              .call(brush)
              .selectAll("rect")
              .attr("y", -6)
              .attr("height", height + 7);

            draw();


          };

          function draw() {
            content.select("g.x.axis").call(xAxisGen);
            content.select("g.y.axis").call(yAxisGen);
            var path = svg.selectAll("path.line").attr("d", function (d) {
              //console.log(d.values);
              return line(d.values);
            });
            brush.extent(xScale.domain());
            brush(d3.select(".brush").transition());
            brush.event(d3.select(".brush").transition().delay(1000))
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

          /*d3.select(window)
           .on("scroll.scroller", log);

           function log() {
           console.log("scrolling");
           }*/

          function brushed() {
            //console.log(brush.extent());
            scope.brushed({args: brush.extent()});
          }

          function filterOut(items, search) {
            var result = [];
            items.map(function (value) {
              if (value.user != search)
                result.push(value);

            });
            return result;

          }

          //Watch 'data' and run scope.render(newVal) whenever it changes
          //Use true for 'objectEquality' property so comparisons are done on equality and not reference
          scope.$watch('data', function (newVal, oldVal) {
            //console.log(newVal);
            //if (oldVal.length > 0) {
            //values.concat(oldVal);
            //}
            //TODO - send only user id when you want to delete it
            //reset after date switch
            if (newVal === null) {
              users = [];
              datas = [];
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
