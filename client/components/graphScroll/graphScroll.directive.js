'use strict';

angular.module('citizensemakersApp')
  .directive('graphScroll', ['$window', 'd3Service', function ($window, d3Service) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        active: '&active',
        scroll: '&scroll'
      },
      controller: function ($scope) {
        //added self parameter because of d3 service
        var self = this;
        d3Service.d3().then(function (d3) {

          function graphScroll() {
            //console.log(element.find('sectio));
            //console.log(d3.selectAll('#sections > section'));

            var windowHeight,
              dispatch = d3.dispatch("scroll", "active"),
              sections = d3.select('null'),
              i = NaN,
              sectionPos = [],
              n,
              graph = d3.select('null'),
              isFixed = null,
              isBelow = null,
              container = d3.select('body'),
            /*
             dispatch = d3.dispatch("scroll", "active"),
             sections = element.find('section'),
             i = NaN,
             sectionPos = [],
             n,
             graph = d3.select('#simpleline'),
             isFixed = null,
             isBelow = null,
             container = element,
             */
              containerStart = 0,
              belowStart,
              eventId = Math.random();

            //console.log(sections);
            //console.log(container);

            function reposition() {
              var i1 = 0;
              sectionPos.forEach(function (d, i) {
                if (d < pageYOffset - containerStart + 200) i1 = i
              });
              i1 = Math.min(n - 1, i1);
              if (i != i1) {
                sections.classed('graph-scroll-active', function (d, i) {
                  return i === i1
                });

                dispatch.active(i1);

                i = i1
              }

              var isBelow1 = pageYOffset > belowStart;
              if (isBelow != isBelow1) {
                isBelow = isBelow1;
                graph.classed('graph-scroll-below', isBelow)
              }
              var isFixed1 = !isBelow && pageYOffset > containerStart;
              if (isFixed != isFixed1) {
                isFixed = isFixed1;
                graph.classed('graph-scroll-fixed', isFixed)
              }
            }

            function resize() {
              sectionPos = [];
              var startPos;
              sections.each(function (d, i) {
                if (!i) startPos = this.getBoundingClientRect().top;
                sectionPos.push(this.getBoundingClientRect().top - startPos)
              })

              var containerBB = container.node().getBoundingClientRect();
              var graphBB = graph.node().getBoundingClientRect();

              containerStart = containerBB.top + pageYOffset;
              belowStart = containerBB.bottom - graphBB.height + pageYOffset;
            }

            function keydown() {
              if (!isFixed) return;
              var delta;
              switch (d3.event.keyCode) {
                case 39: // right arrow
                  if (d3.event.metaKey) return;
                case 40: // down arrow
                case 34: // page down
                  delta = d3.event.metaKey ? Infinity : 1;
                  break;
                case 37: // left arrow
                  if (d3.event.metaKey) return;
                case 38: // up arrow
                case 33: // page up
                  delta = d3.event.metaKey ? -Infinity : -1;
                  break;
                /*case 32: // space
                 delta = d3.event.shiftKey ? -1 : 1;
                 break;*/
                default:
                  return
              }

              var i1 = Math.max(0, Math.min(i + delta, n - 1));
              d3.select(document.documentElement)
                .interrupt()
                .transition()
                .duration(500)
                .tween("scroll", function () {
                  var i = d3.interpolateNumber(pageYOffset, sectionPos[i1] + containerStart)
                  return function (t) {
                    scrollTo(0, i(t))
                  }
                })

              d3.event.preventDefault()
            }


            var rv = {}

            rv.container = function (_x) {
              if (!_x) return container;

              container = _x;
              return rv;
            }

            rv.graph = function (_x) {
              if (!_x) return graph;

              graph = _x;
              return rv;
            }

            rv.eventId = function (_x) {
              if (!_x) return eventId;

              eventId = _x;
              return rv;
            }

            rv.sections = function (_x) {
              if (!_x) return sections;

              sections = _x;
              n = sections.size();

              d3.select($window)
                .on('scroll.gscroll' + eventId, reposition)
                .on('resize.gscroll' + eventId, resize)
                .on('keydown.gscroll' + eventId, keydown);

              resize();
              d3.timer(function () {
                reposition();
                return true;
              });

              return rv;
            };

            d3.rebind(rv, dispatch, "on");


            return rv;

          }

          //create function for each section
          var updateFunctions = $scope.updateFunctions = d3.range(d3.selectAll('#sections > section').size())
            .map(function () {
              return function () {
              }
            });

          //function for adding charts from graph directive
          self.addGraph = function (updatefunc) {
            //updateFunctions.push(updatefunc);
            //console.log(updateFunctions);

          };
          //TODO - not a good way, make dynamic;
          graphScroll()
            .container(d3.select('#container'))
            .graph(d3.selectAll('#graph'))
            .sections(d3.selectAll('#sections > section'))
            .on('active', function (i) {
              //console.log(d);
              //console.log(i);
              //$scope.active({args: i});
            });


        });
      },
      template: '<div class="row"><div id="vis" ng-transclude></div></div>'
    };
  }])
  .directive('graph', ['$window', 'd3Service', function ($window, d3Service) {
    return {
      template: '<svg width="960" height="500"></svg>',
      restrict: 'EA',
      require: '^graphScroll',
      //transclude: true,
      scope: {
        data: '=?',
        brushed: '&brushed',
        interpolate: '=?'
      },
      link: function (scope, element, attrs, graphCtrl) {
        d3Service.d3().then(function (d3) {
          graphCtrl.addGraph(null);
          var xScale, yScale, xAxisGen, yAxisGen, line, path, color, brush, content;
          var users = [];
          var datas = [];

          var margin = {top: 10, right: 10, bottom: 100, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

          //TODO - make this element reference better
          var rawSvg = element.find('svg');
          var svg = d3.select(rawSvg[0])
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
          //.append("g")
          //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          xScale = d3.time.scale()
            .rangeRound([0, width]);

          yScale = d3.scale.linear()
            .rangeRound([height, 0]);

          xAxisGen = d3.svg.axis()
            //.tickValues(["1944","2015"])
            .scale(xScale)
            .orient("bottom");

          yAxisGen = d3.svg.axis()
            .scale(yScale)
            .orient("right")
            .tickFormat(d3.format(".2s"));

          brush = d3.svg.brush()
            .x(xScale)
            .on("brush", brushed);

          color = d3.scale.category10();


          line = d3.svg.line()
            .x(function (d) {
              return xScale(d.time);
            })
            .y(function (d) {
              return yScale(d.value);
            })
            .interpolate(scope.interpolate);


          //canvas for the stuff
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

            //default brush
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

          function brushed() {
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
            //if (oldVal.length > 0) {
            //values.concat(oldVal);
            //}
            //TODO - send only user id when you want to delete it
            //reset after date switch
            if (newVal === null || typeof newVal === 'undefined') {
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
