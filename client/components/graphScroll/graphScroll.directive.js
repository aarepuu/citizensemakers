'use strict';

angular.module('citizensemakersApp')
  .directive('graphScroll', ['$window', 'd3Service', function ($window, d3Service) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        ready: '=?',
        active: '&active',
        scroll: '&scroll'
      },
      controller: function ($scope) {
        //added self parameter because of d3 service
        var self = this;
        var updateFunctions = [];
        d3Service.d3().then(function (d3) {

          function graphScroll() {
            //console.log(element.find('sectio));
            //console.log(d3.selectAll('#sections > section'));

            var windowHeight,
              dispatch = d3.dispatch("scroll", "active"),
              leftsections = d3.select('null'),
              rightsections = d3.select('null'),
              i = NaN,
              sectionPos = [],
              n,
              graph = d3.select('null'),
              isFixed = null,
              isBelow = null,
              container = d3.select('body'),
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
                leftsections.classed('graph-scroll-active', function (d, i) {
                  return i === i1
                });
                rightsections.classed('graph-scroll-active', function (d, i) {
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
              leftsections.each(function (d, i) {
                if (!i) startPos = this.getBoundingClientRect().top;
                sectionPos.push(this.getBoundingClientRect().top - startPos)
              });


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

            rv.leftsections = function (_x) {
              if (!_x) return leftsections;

              leftsections = _x;
              n = leftsections.size();

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

            rv.rightsections = function (_x) {
              if (!_x) return rightsections;

              rightsections = _x;

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
          self.addGraph = function (updatefunc, loc) {
            //updateFunctions.push(updatefunc);
            updateFunctions[loc] = updatefunc;
            //console.log(updateFunctions);

          };


          //TODO - not a good way, make dynamic;
          //console.log(d3.selectAll('#sections2')[0]);
          $scope.$watch('ready', function (val) {
            if (!val) return;
            //console.log(d3.selectAll('#sections2 > section'));
            var lastI = -1
            var activeI = 0
            graphScroll()
              .container(d3.select('#container'))
              .graph(d3.selectAll('#graph'))
              .rightsections(d3.selectAll('#sections2 > section'))
              .leftsections(d3.selectAll('#sections > section'))
              .on('active', function (i) {
                console.log(i);
                if (updateFunctions.length === 0) return;
                activeI = i
                //call all fns last and active index
                var sign = activeI - lastI < 0 ? -1 : 1
                d3.range(lastI + sign, activeI + sign, sign).forEach(function (i) {
                  updateFunctions[i]()
                })

                lastI = activeI

                d3.selectAll('#sections > section')
                  .transition().duration(function (d, i) {
                    return i == activeI ? 0 : 600
                  })
                  .style('opacity', function (d, i) {
                    return i == activeI ? 1 : i == activeI + 1 ? .2 : .001
                  })
                //console.log(d);

                //$scope.active({args: i});
              });
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
          var xScale, yScale, xAxisGen, yAxisGen, color, brush, content, sleepScale, stepsXScale, stepsYScale, x1, heartsXScale, heartsYScale;
          //TODO - really bad solution
          var users1 = [];
          var users2 = [];
          var users3 = [];
          //0 - hr, 1 - sleep, 2 - steps
          var sleepData = [];
          var stepsData = [];
          var heartsData = [];

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
            .range([0, width]);

          yScale = d3.scale.linear()
            .range([height, 0]);

          x1 = d3.scale.ordinal();

          xAxisGen = d3.svg.axis()
            //.tickValues(["1944","2015"])
            .scale(xScale)
            .orient("bottom");

          //1 ("asleep"), 2 ("awake"), or 3 ("really awake").
          function sleepFormat(d) {
            if (d == 1) {
              return "Asleep";
            } else if (d == 2) {
              return "Awake";
            } else if (d == 3) {
              return "Really Awake";
            }
            return "";
          }

          yAxisGen = d3.svg.axis()
            .scale(yScale)
            .ticks(5)
            .orient("right")
          //.tickFormat(sleepFormat);

          brush = d3.svg.brush()
            .x(xScale)
            .on("brush", brushed);

          color = d3.scale.category10();


          //canvas for the stuff
          content = svg.append("g")
            .attr("class", "content")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
          //.text("Beats per minute");


          //Render graph based on incoming 'data'
          scope.renderSleep = function (data) {
            // process data
            //Check if we have to remove data
            var index = users1.indexOf(data[data.length - 1].user);
            if (index != -1) {
              users1.splice(index, 1);
              //TODO - make more generic
              sleepData = filterOut(sleepData, data[data.length - 1].user);

            } else {
              //proccess data
              data.forEach(function (d) {
                d.time = new Date(d.time * 1000);
              });

              users1.push(data[data.length - 1].user);
              sleepData.push({user: data[data.length - 1].user, values: data});
            }

            //Set our scale's domains
            //different colors for users
            color.domain(users1);


            sleepScale = [
              d3.min(sleepData, function (c) {
                return d3.min(c.values, function (v) {
                  return v.time;
                });
              }),
              d3.max(sleepData, function (c) {
                return d3.max(c.values, function (v) {
                  return v.time;
                });
              })
            ];
            xScale.domain(sleepScale);


            /*yScale.domain([
             d3.min(sleepData, function (c) {
             return d3.min(c.values, function (v) {
             return v.value;
             });
             }),
             d3.max(sleepData, function (c) {
             return d3.max(c.values, function (v) {
             return v.value;
             });
             })
             ]);*/

            //for sleep
            yScale.domain([0, 4]);


            //SVG stuff
            //Remove the axes so we can draw updated ones
            /*
             svg.selectAll('g.axis').remove();
             svg.selectAll('path').remove();
             svg.selectAll('text').remove();
             svg.selectAll('rect').remove();
             svg.selectAll(".sleep").remove();
             */

            //Legend for all the charts
            //TODO - make it stuck and make it into a menu
            var legend = d3.select('#people').append('svg').append("g")
              //.attr("transform", "translate(" + 780 + "," + 320 + ")");
              .attr("transform", "translate(50,30)");
            legend.selectAll(".legend-dots")
              .data(color.domain())
              .enter().append("circle")
              .attr("class", "legend legend-dots")
              .attr("cx", 0)
              .attr("cy", function (d, i) {
                return i * 23
              })
              .attr("r", 8)
              .style("fill", function (d) {
                return color(d)
              })
              .style("opacity", 1);

            legend.selectAll(".legend-labels")
              .data(color.domain())
              .enter().append("text")
              .attr("class", "legend legend-labels")
              .attr("x", 14)
              .attr("y", function (d, i) {
                return 3 + (i * 24)
              })
              .text(function (d) {
                return d
              })
              .style("opacity", 1);


            // remove data befofre rendering
            content.selectAll(".sleep").remove();

            var sleep = content.selectAll(".sleep")
              .data(sleepData)
              .enter().append("g")
              .attr("class", "sleep")


            sleep.append("path")
              .attr("class", function (d) {
                return "sleep line y" + d.user;
              })
              .attr("id", function (d) {
                return d.user;
              })
              .style("stroke", function (d) {
                return color(d.user);
              })
              .style("opacity", 1);


            //add brush
            content.append("g")
              .attr("class", "x brush")
              .call(brush)
              .selectAll("rect")
              .attr("y", -6)
              .attr("height", height + 7);


            //add functions
            graphCtrl.addGraph(drawSleep, 0);

            //init first graph
            drawSleep();


          };


          //Render graph based on incoming 'data'
          scope.renderSteps = function (data) {
            // process data
            //Check if we have to remove data
            var index = users2.indexOf(data[data.length - 1].user);
            if (index != -1) {
              users2.splice(index, 1);
              //TODO - make more generic
              stepsData = filterOut(stepsData, data[data.length - 1].user);

            } else {
              //proccess data
              data.forEach(function (d) {
                d.time = new Date(d.time * 1000);
              });

              users2.push(data[data.length - 1].user);
              stepsData.push({user: data[data.length - 1].user, values: data});
            }

            //Set our scale's domains
            //different colors for users
            color.domain(users2);


            stepsXScale = [
              d3.min(stepsData, function (c) {
                return d3.min(c.values, function (v) {
                  return v.time;
                });
              }),
              d3.max(stepsData, function (c) {
                return d3.max(c.values, function (v) {
                  return v.time;
                });
              })
            ];

            stepsYScale = [
              d3.min(stepsData, function (c) {
                return d3.min(c.values, function (v) {
                  return v.value;
                });
              }),
              d3.max(stepsData, function (c) {
                return d3.max(c.values, function (v) {
                  return v.value;
                });
              })
            ];
            /*
             x1.domain(users).rangeRoundBands([0, d3.max(stepsData, function (c) {
             return d3.max(c.values, function (v) {
             return v.time;
             });
             })]);
             //console.log(x1.rangeBand());

             var step = content.selectAll(".step")
             .data(stepsData)
             .enter().append("g")
             .attr("class", "step")
             //.attr("transform", function(d) { return "translate(" + xScale(d.user) + ",0)"; });

             step.selectAll("rect")
             .data(function (d) {
             return d.values;
             })
             .enter().append("rect")
             .attr("width", 10)
             .attr("x", function (d) {
             return xScale(d.time);
             })
             .attr("y", function (d) {
             return yScale(d.value);
             })
             .attr("height", function (d) {
             return height - yScale(d.value);
             })
             .style("fill", function (d) {
             return color(d.user);
             })
             .style("opacity", 1);

             content.selectAll(".bar")
             .data(stepsData)
             .enter().append("rect")
             .attr("class", function (d) {
             return "steps bar y" + d.user;
             })
             .attr("x", function (d) {
             console.log(d);
             return d.values.map(function (v) {
             console.log(xScale(+v.time));
             return xScale(+v.time);
             //return +v.time;
             });
             //return +d.time;
             })
             .attr("y", function (d) {
             return d.values.map(function (v) {
             return +v.value;
             });
             })
             .attr("width", 3)
             .attr("height", function (d) {
             return d.values.map(function (v) {
             return height - yScale(v.value);
             });
             })
             .style("fill", function (d) {
             return color(d.user);
             })
             .style("opacity", 1);
             */


            var steps = content.selectAll(".steps")
              .data(stepsData)
              .enter().append("g")
              .attr("class", "steps")


            steps.append("path")
              .attr("class", function (d) {
                return "steps line y" + d.user;
              })
              .attr("id", function (d) {
                return d.user;
              })
              .style("stroke", function (d) {
                return color(d.user);
              })
              .style("opacity", 0);

            //console.log(stepsData);
            //add functions
            graphCtrl.addGraph(drawSteps, 1);


          };

          //Render graph based on incoming 'data'
          scope.renderHearts = function (data) {
            // process data
            //Check if we have to remove data
            var index = users3.indexOf(data[data.length - 1].user);
            if (index != -1) {
              users3.splice(index, 1);
              //TODO - make more generic
              heartsData = filterOut(heartsData, data[data.length - 1].user);

            } else {
              //proccess data
              data.forEach(function (d) {
                d.time = new Date(d.time * 1000);
              });

              users3.push(data[data.length - 1].user);
              heartsData.push({user: data[data.length - 1].user, values: data});
            }

            //Set our scale's domains
            //different colors for users
            color.domain(users3);

            heartsXScale = [
              d3.min(heartsData, function (c) {
                return d3.min(c.values, function (v) {
                  return v.time;
                });
              }),
              d3.max(heartsData, function (c) {
                return d3.max(c.values, function (v) {
                  return v.time;
                });
              })
            ];

            heartsYScale = [
              d3.min(heartsData, function (c) {
                return d3.min(c.values, function (v) {
                  return v.value;
                });
              }),
              d3.max(heartsData, function (c) {
                return d3.max(c.values, function (v) {
                  return v.value;
                });
              })
            ];

            // remove data befofre rendering
            content.selectAll(".hr").remove();

            var hr = content.selectAll(".hr")
              .data(heartsData)
              .enter().append("g")
              .attr("class", "hr")


            hr.append("path")
              .attr("class", function (d) {
                return "hr line y" + d.user;
              })
              .attr("id", function (d) {
                return d.user;
              })
              .style("stroke", function (d) {
                return color(d.user);
              })
              .style("opacity", 0);



            console.log(hr);
            //add functions
            graphCtrl.addGraph(drawHearts, 2);


          };

          function drawSleep() {
            xScale.domain(sleepScale);
            yScale.domain([0, 4]);
            yAxisGen.tickFormat(sleepFormat);

            var t = content.transition().duration(3500);
            t.select(".x.axis").style("opacity", 1).call(xAxisGen);
            t.select(".y.axis").style("opacity", 1).call(yAxisGen);
            t.select(".text").style("opacity", 1);

            /*
             var t2 = d3.transition().duration(0)
             t2.selectAll(".state-labels").style("opacity", 0);
             t2.selectAll(".bgbar").style("opacity", 0);
             t2.selectAll(".legend").style("opacity", 0);
             infections.transition().duration(0).style("opacity", 0);
             vlegend.transition().duration(0).style("opacity", 0);

             t.selectAll(".stackedbar")
             .attr("x", function (d) {
             return x(d.year);
             })
             .attr("y", function (d) {
             return y(+d.y1);
             })
             .attr("width", x.rangeBand())
             .attr("height", function (d) {
             return y(+d.y0) - y(+d.y1);
             })
             .style("fill", "#6488FF");
             */
            var line = d3.svg.line()
              .x(function (d) {
                return xScale(d.time);
              })
              .y(function (d) {
                return yScale(d.value);
              })
              .interpolate('step-after');

            var path = d3.selectAll("path.sleep").attr("d", function (d) {
              //console.log(d.values);
              return line(d.values);
            });
            var totalLength = path.node().getTotalLength();
            path
              .attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
              .duration(2000)
              .ease("linear")
              .attr("stroke-dashoffset", 0).style("opacity", 1);


            var stepsPath = d3.selectAll("path.steps");
            if (stepsPath.node() != null) {
              var totalLength = stepsPath.node().getTotalLength();
              stepsPath
                .transition()
                .duration(2000)
                .ease("linear")
                .attr("stroke-dashoffset", totalLength).style("opacity", 0);

            }


            //default brush
            brush.extent(xScale.domain());
            brush(d3.select(".brush").transition());
            brush.event(d3.select(".brush").transition().delay(1000))

          }

          function drawSteps() {
            xScale.domain(stepsXScale);
            yScale.domain(stepsYScale);
            yAxisGen.ticks();

            var t = content.transition().duration(3500);
            t.select(".x.axis").style("opacity", 1).call(xAxisGen);
            t.select(".y.axis").style("opacity", 1).call(yAxisGen);
            t.select(".text").style("opacity", 0);


            var line = d3.svg.line()
              .x(function (d) {
                return xScale(d.time);
              })
              .y(function (d) {
                return yScale(d.value);
              }).interpolate('step-before');
            var stepsPath = d3.selectAll("path.steps").attr("d", function (d) {
              //console.log(d.values);
              return line(d.values);
            }).style("opacity", 1);
            var totalLength = stepsPath.node().getTotalLength();
            stepsPath
              .attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
              .duration(2000)
              .ease("linear")
              .attr("stroke-dashoffset", 0);


            var sleepsPath = d3.selectAll("path.sleep");
            if (stepsPath.node() != null) {
              var totalLength = sleepsPath.node().getTotalLength();
              sleepsPath
                .transition()
                .duration(2000)
                .ease("linear")
                .attr("stroke-dashoffset", totalLength).style("opacity", 0);

            }

            var hrPath = d3.selectAll("path.hr");
            if (hrPath.node() != null) {
              var totalLength = hrPath.node().getTotalLength();
              hrPath
                .transition()
                .duration(2000)
                .ease("linear")
                .attr("stroke-dashoffset", totalLength).style("opacity", 0);

            }


          }

          function drawHearts() {
            xScale.domain(heartsXScale);
            yScale.domain(heartsYScale);
            //yAxisGen.tickFormat(sleepFormat);

            var t = content.transition().duration(3500);
            t.select(".x.axis").style("opacity", 1).call(xAxisGen);
            t.select(".y.axis").style("opacity", 1).call(yAxisGen);
            t.select(".text").style("opacity", 0);


            var line = d3.svg.line()
              .x(function (d) {
                return xScale(d.time);
              })
              .y(function (d) {
                return yScale(d.value);
              }).interpolate('basis');

            var hrPath = d3.selectAll("path.hr").attr("d", function (d) {
              //console.log(d.values);
              return line(d.values);
            }).style("opacity", 1);

            var totalLength = hrPath.node().getTotalLength();
            hrPath
              .attr("stroke-dasharray", totalLength + " " + totalLength)
              .attr("stroke-dashoffset", totalLength)
              .transition()
              .duration(2000)
              .ease("linear")
              .attr("stroke-dashoffset", 0);

            var stepsPath = d3.selectAll("path.steps");
            if (stepsPath.node() != null) {
              var totalLength = stepsPath.node().getTotalLength();

              stepsPath
                .transition()
                .duration(2000)
                .ease("linear")
                .attr("stroke-dashoffset", totalLength).style("opacity", 0);

            }

          }

          function draw() {
            content.select("g.x.axis").call(xAxisGen);
            content.select("g.y.axis").call(yAxisGen);
            var path = svg.selectAll("path.line").attr("d", function (d) {
              //console.log(d.values);
              return line(d.values);
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
          //heartrates
          /*
           scope.$watch('data[0]', function (newVal, oldVal) {
           //newVal = newVal[0];
           //if (oldVal.length > 0) {
           //values.concat(oldVal);
           //}
           //TODO - send only user id when you want to delete it
           //reset after date switch
           if (newVal === [] || typeof newVal === 'undefined') {
           users = [];
           sleepData = [[],[],[]];
           } else {
           if (newVal.length > 0) {
           scope.render(newVal);
           }
           }

           });*/

          //heartrates
          scope.$watch('data[0]', function (newVal, oldVal) {
            //newVal = newVal[0];
            //if (oldVal.length > 0) {
            //values.concat(oldVal);
            //}
            //TODO - send only user id when you want to delete it
            //reset after date switch
            if (newVal === [] || typeof newVal === 'undefined') {
              users3 = [];
              sleepData = [];
            } else {
              if (newVal.length > 0) {
                //console.log(newVal);
                scope.renderHearts(newVal);
              }
            }

          });

          //sleep
          scope.$watch('data[1]', function (newVal, oldVal) {
            //newVal = newVal[0];
            //if (oldVal.length > 0) {
            //values.concat(oldVal);
            //}
            //TODO - send only user id when you want to delete it
            //reset after date switch
            if (newVal === [] || typeof newVal === 'undefined') {
              users1 = [];
              sleepData = [];
            } else {
              if (newVal.length > 0) {
                scope.renderSleep(newVal);
              }
            }

          });
          //steps
          scope.$watch('data[2]', function (newVal, oldVal) {
            //newVal = newVal[0];
            //if (oldVal.length > 0) {
            //values.concat(oldVal);
            //}
            //TODO - send only user id when you want to delete it
            //reset after date switch
            if (newVal === [] || typeof newVal === 'undefined') {
              users2 = [];
              stepsData = [];
            } else {
              if (newVal.length > 0) {
                //console.log(newVal);
                scope.renderSteps(newVal);
              }
            }

          });


          scope.$watchCollection('data', function (newVal, oldVal){
            //console.log(newVal);
          });

        });

      }
    };
  }]);
