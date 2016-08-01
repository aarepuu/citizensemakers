'use strict';

angular.module('charts')
  .directive('lineChart', ['d3Service', function (d3Service) {
    return {
      restrict: 'EA',
      template: "<svg width='960' height='500'></svg>",
      scope: {
        data: '=?',
        clicked: '&clicked',
        interpolate: '=?'
      },
      link: function (scope, element, attrs) {
        d3Service.d3().then(function (d3) {

          var padding = 25;
          var margin = {top: 10, right: 10, bottom: 100, left: 40},
            margin2 = {top: 430, right: 10, bottom: 20, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            height2 = 500 - margin2.top - margin2.bottom;
          var pathClass = "line";
          var xScale, xScale2, yScale, yScale2, xAxisGen, xAxisGen2, yAxisGen, line, path, color, zoom, brush, focus, context;
          var users = [];
          var values = [];

          var rawSvg = element.find('svg');
          var svg = d3.select(rawSvg[0])
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

          xScale = d3.time.scale()
            .range([0, width]);
          xScale2 = d3.time.scale()
            .range([0, width]);

          yScale = d3.scale.linear()
            .range([height, 0]);
          yScale2 = d3.scale.linear()
            .range([height2, 0]);

          xAxisGen = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .tickSize(-(width), 0)
            .tickPadding(6);


          xAxisGen2 = d3.svg.axis()
            .scale(xScale2)
            .orient("bottom")
            .tickSize(height2, 0);
          //.tickPadding(6);


          yAxisGen = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .tickSize(-(width))
            .tickPadding(6);

          brush = d3.svg.brush()
            .x(xScale2)
            .on("brush", brushed);

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

          var area = d3.svg.area()
            .interpolate("monotone")
            .x(function (d) {
              return xScale2(d.time);
            })
            .y0(height2)
            .y1(function (d) {
              return yScale2(d.value);
            });


          focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");



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
            //console.log(users);
            values.push(data);
            //console.log(values);
            var datas = color.domain().map(function (user, i) {
              return {
                user: user,
                values: values[i]
              };
            });
            //console.log(datas);
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
            xScale2.domain(xScale.domain());
            yScale2.domain(yScale.domain());

            //Remove the axes so we can draw updated ones
            //TODO - make this into a function
            svg.selectAll('g.axis').remove();
            svg.selectAll('path').remove();
            svg.selectAll('text').remove();
            svg.selectAll('rect').remove();
            svg.selectAll(".user").remove();


            //Render X axis
            focus.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
            //.attr("transform", "translate(0,180)");
            //.call(xAxisGen);


            //Render Y axis
            focus.append("g")
              .attr("class", "y axis")
              //.attr("transform", "translate(20,0)")
              //.call(yAxisGen)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Beats per minute");


            var user = focus.selectAll(".user")
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


            zoom.x(xScale);
            //svg.select("path.line").data([data]);


            context.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height2 + ")")
            //.attr("transform", "translate(0,180)")
            //.call(xAxisGen2);

            //add brush
            context.append("g")
              .attr("class", "x brush")
              .call(brush)
              .selectAll("rect")
              .attr("y", -6)
              .attr("height", height2 + 7);

            context.append("path")
              .data(datas)
              .attr("class", "area")
              .attr("d", area);

            focus.append("rect")
              .attr("class", "pane")
              .attr("width", width)
              .attr("height", height)
              .call(zoom);

            draw();


          };

          function draw() {
            focus.select("g.x.axis").call(xAxisGen);
            focus.select("g.y.axis").call(yAxisGen);
            context.select("g.x.axis").call(xAxisGen2);
            //console.log(svg.select("path.line").attr("d"));
            //svg.select("path.line").attr("d", line);
            //console.log(svg.select("path.line"));
            var path = svg.selectAll("path.line").attr("d", function (d) {
              //console.log(d.values);
              return line(d.values);
            });
            var path = svg.selectAll("path.area").attr("d", function (d) {
              //console.log(d.values);
              return area(d.values);
            });

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
            //xScale.domain(brush.empty() ? xScale.domain() : brush.extent());
            //svg.select(".path").attr("d", area);
            //svg.select("g.x.axis").call(xAxisGen);
            console.log(brush.extent());
            xScale.domain(brush.empty() ? xScale2.domain() : brush.extent());
            focus.selectAll("path.line").attr("d", function (d) {
              //console.log(d.values);
              return line(d.values);
            });
            focus.select("g.x.axis").call(xAxisGen);
            //draw();
          }

          //Watch 'data' and run scope.render(newVal) whenever it changes
          //Use true for 'objectEquality' property so comparisons are done on equality and not reference
          scope.$watch('data', function (newVal, oldVal) {
            //console.log(newVal);
            //if (oldVal.length > 0) {
            //values.concat(oldVal);
            //}
            //TODO - send only user id when you want to delete it

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

