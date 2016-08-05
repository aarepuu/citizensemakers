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
            //console.log(val);
            if (val != 2) return;
            //console.log(d3.selectAll('#sections2 > section'));
            var lastI = -1
            var activeI = 0
            graphScroll()
              .container(d3.select('.container-fluid'))
              .graph(d3.selectAll('#graph'))
              .rightsections(d3.selectAll('#sections2 > section'))
              .leftsections(d3.selectAll('#sections > section'))
              .on('active', function (i) {
                //console.log(i);
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
      template: '<svg id="graphsvg" width="960" height="500"></svg>',
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
            var xScale, yScale, xScale2, yScale2, xAxisGen, xAxisGen2,
              yAxisGen, color, brush, content, overview, sleepScale,
              stepsXScale, stepsYScale, stepsXScale2, stepsYScale2,
              heartsXScale, heartsYScale, heartsXScale2, heartsYScale2;


            //TODO - really bad solution
            var users1 = [];
            var users2 = [];
            var users3 = [];
            //0 - hr, 1 - sleep, 2 - steps
            var sleepData = [];
            var stepsData = [];
            var stepsData2 = [];
            var stepsData3 = [];
            var heartsData = [];
            var heartsData2 = [];
            var heartsData3 = [];

            var margin = {top: 10, right: 10, bottom: 100, left: 40},
              margin2 = {top: 430, right: 10, bottom: 20, left: 40},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom,
              height2 = 500 - margin2.top - margin2.bottom;


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
            xScale2 = d3.time.scale()
              .range([0, width]);

            yScale = d3.scale.linear()
              .range([height, 0]);
            yScale2 = d3.scale.linear()
              .range([height2, 0]);

            xAxisGen = d3.svg.axis()
              //.tickValues(["1944","2015"])
              //.tickValues(d3.range(hei, 80, 4));
              .ticks(20)
              .scale(xScale)
              .orient("bottom");

            xAxisGen2 = d3.svg.axis()
              .scale(xScale2)
              .orient("bottom")
              .tickSize(height2, 0);
            //.tickPadding(6);

            //1 ("asleep"), 2 ("awake"), or 3 ("really awake").
            function sleepFormat(d) {
              if (d == 1) {
                return "Asleep";
              } else if (d == 2) {
                return "REM";
              } else if (d == 3) {
                return "Awake";
              }
              return "";
            }

            yAxisGen = d3.svg.axis()
              .scale(yScale)
              //.ticks(5)
              .orient("left")
            //.tickFormat(sleepFormat);

            brush = d3.svg.brush()
              .x(xScale)
              .on("brush", brushed);

            color = d3.scale.category10();


            //canvas for the stuff
            content = svg.append("g")
              .attr("id", "content")
              .attr("class", "content")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //overview chart
            /*overview = svg.append("g")
             .attr("id", "overview")
             .attr("class", "overview")
             .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");*/

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
              data = JSON.parse(JSON.stringify(data));
              // process data
              //Check if we have to remove data
              if (data[data.length - 1].remove) {
                var index = users1.indexOf(data[data.length - 1].user);
                if (index != -1) {
                  users1.splice(index, 1);
                  //TODO - make more generic
                  sleepData = filterOut(sleepData, data[data.length - 1].user);

                } else {
                  return;
                }
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
              //sleep is first graph, so set domains
              xScale.domain(sleepScale);
              yScale.domain([0, 4]);
              //xScale2.domain(xScale.domain());
              //yScale2.domain([50, 200]);


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

              //SVG stuff
              //Remove the axes so we can draw updated ones
              /*
               svg.selectAll('g.axis').remove();
               svg.selectAll('path').remove();
               svg.selectAll('text').remove();
               svg.selectAll('rect').remove();
               svg.selectAll(".sleep").remove();
               */

              d3.select('#people > svg').remove();

              //Legend for all the charts
              //TODO - make it stuck and make it into a menu
              var legend = d3.select('#people').append('svg').append("g")
                .attr("class", "legend")
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


              // remove data before rendering
              content.selectAll(".sleep").remove();

              var sleep = content.selectAll(".sleep")
                .data(sleepData)
                .enter().append("g")
                .attr("class", "graph sleep")


              sleep.append("path")
                .attr("class", function (d) {
                  return "sleep line u" + d.user;
                })
                //.attr("id", function (d) {
                //return d.user;
                //})
                .style("stroke", function (d) {
                  return color(d.user);
                })
                .style("opacity", 1);

              content.selectAll('.brush').remove();

              //add brush
              content.append("g")
                .attr("class", "x brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", -6)
                .attr("height", height + 7);

              /*
               overview.append("g")
               .attr("class", "x axis")
               .attr("transform", "translate(0," + height2 + ")")
               //.attr("transform", "translate(0,180)")
               //.call(xAxisGen2);

               overview.append("path")
               .data(heartsData)
               .attr("class", "area")
               .attr("id", "hrarea")
               //.attr("d", area);
               */
              //add functions
              graphCtrl.addGraph(drawSleep, 0);

              //init first graph
              drawSleep();


            };


            //Render graph based on incoming 'data'
            scope.renderSteps = function (data, pos, database) {
              //console.log("rendersteps");
              data = JSON.parse(JSON.stringify(data));
              // process data
              var index = users2.indexOf(data[data.length - 1].user);
              //Check if we have to remove data
              if (data[data.length - 1].remove) {
                if (index != -1) {
                  users2.splice(index, 1);
                  //TODO - make more generic
                  database = filterOut(database, data[data.length - 1].user);
                } else {
                  return;
                }
              }
              //proccess data
              data.forEach(function (d) {
                d.time = new Date(d.time * 1000);
              });
              //Set our scale's domains
              //different colors for users

              if (pos == 1) {
                var cutoffDate = moment(data[data.length - 1].time).hour(9).minute(0);
                //cutoffDate.setDate(cutoffDate.getDate() - 90);
                //console.log(cutoffDate.toDate())
                data = data.filter(function (d) {
                  return d.time < cutoffDate;
                });

                if (data.length == 0) return;

                database.push({user: data[data.length - 1].user, values: data});

                stepsXScale = [
                  d3.min(database, function (c) {
                    return d3.min(c.values, function (v) {
                      return v.time;
                    });
                  }),
                  d3.max(database, function (c) {
                    return d3.max(c.values, function (v) {
                      return v.time;
                    });
                  })
                ];

                stepsYScale = [
                  d3.min(database, function (c) {
                    return d3.min(c.values, function (v) {
                      return v.value;
                    });
                  }),
                  d3.max(database, function (c) {
                    return d3.max(c.values, function (v) {
                      return v.value;
                    });
                  })
                ];

                //set scales for calculating
                //TODO - can be done in animation phase
                xScale.domain(stepsXScale);
                yScale.domain(stepsYScale);

              } else if (pos == 3) {
                var startDate = moment(data[data.length - 1].time).hour(12).minute(0);
                var endDate = moment(data[data.length - 1].time).hour(14).minute(0);
                data = data.filter(function (d) {
                  return (d.time >= startDate) && (d.time <= endDate);
                });

                if (data.length == 0) return;
                database.push({user: data[data.length - 1].user, values: data});

                stepsXScale2 = [
                  d3.min(database, function (c) {
                    return d3.min(c.values, function (v) {
                      return v.time;
                    });
                  }),
                  d3.max(database, function (c) {
                    return d3.max(c.values, function (v) {
                      return v.time;
                    });
                  })
                ];

                stepsYScale2 = [
                  d3.min(database, function (c) {
                    return d3.min(c.values, function (v) {
                      return v.value;
                    });
                  }),
                  d3.max(database, function (c) {
                    return d3.max(c.values, function (v) {
                      return v.value;
                    });
                  })
                ];
                //set scales for calculating
                //TODO - can be done in animation phase
                xScale.domain(stepsXScale2);
                yScale.domain(stepsYScale2);

              }
              if (index == -1) {
                users2.push(data[data.length - 1].user);
              }
              color.domain(users2);


              content.selectAll(".step-" + pos).remove();

              var step = content.selectAll(".step-" + pos)
                .data(database)
                .enter().append("g")
                .attr("class", "steps step-" + pos)
                .attr("transform", function (d) {
                  d.values.map(function (c) {
                    return "translate(" + xScale(c.time) + ",0)";
                  });
                });

              step.selectAll("rect")
                .data(function (d) {
                  return d.values;
                })
                .enter().append("rect")
                .attr("width", 0.5)
                .attr("class", function (d) {
                  return "steps step-" + pos + " rect" + d.user;
                })
                .attr("x", function (d) {
                  return xScale(d.time);
                })
                .attr("y", function (d) {
                  return height;
                })
                .attr("height", 0)
                .style("fill", function (d) {
                  return color(d.user);
                })
                .style("opacity", 1);


              /*
               // remove data befofre rendering
               content.selectAll(".steps").remove();

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
               */
              //console.log(stepsData);
              //add functions
              if (pos == 1) {
                graphCtrl.addGraph(drawMorning, pos);
              } else if (pos == 3) {
                graphCtrl.addGraph(drawLunch, pos);
              }

            };

            //Render graph based on incoming 'data'
            scope.renderHearts = function (data, pos, database) {
              // process data
              data = JSON.parse(JSON.stringify(data));
              //Check if we have to remove data
              if (data[data.length - 1].remove) {
                var index = users3.indexOf(data[data.length - 1].user);
                if (index != -1) {
                  users3.splice(index, 1);
                  //TODO - make more generic
                  database = filterOut(database, data[data.length - 1].user);

                } else {
                  return;
                }
              }
              //proccess data
              data.forEach(function (d) {
                d.time = new Date(d.time * 1000);
              });

              if (pos == 2) {
                var startDate = moment(data[data.length - 1].time).hour(9).minute(0);
                var endDate = moment(data[data.length - 1].time).hour(12).minute(0);
                data = data.filter(function (d) {
                  return (d.time >= startDate) && (d.time <= endDate);
                });

                if (data.length == 0) return;
                database.push({user: data[data.length - 1].user, values: data});

                heartsXScale = [
                  d3.min(database, function (c) {
                    return d3.min(c.values, function (v) {
                      return v.time;
                    });
                  }),
                  d3.max(database, function (c) {
                    return d3.max(c.values, function (v) {
                      return v.time;
                    });
                  })
                ];

                heartsYScale = [
                  d3.min(database, function (c) {
                    return d3.min(c.values, function (v) {
                      return v.value;
                    });
                  }),
                  d3.max(database, function (c) {
                    return d3.max(c.values, function (v) {
                      return v.value;
                    });
                  })
                ];

              }
              if (index == -1) {
                users3.push(data[data.length - 1].user);
              }

              //Set our scale's domains
              //different colors for users
              color.domain(users3);


              // remove data befofre rendering
              content.selectAll(".step-" + pos).remove();

              var hr = content.selectAll(".step-" + pos)
                .data(database)
                .enter().append("g")
                .attr("class", "hr step-" + pos);


              hr.append("path")
                .attr("class", function (d) {
                  return "hr step-" + pos + " line line" + d.user;
                })
                .attr("id", function (d) {
                  return d.user;
                })
                .style("stroke", function (d) {
                  return color(d.user);
                })
                .style("opacity", 0);


              //add functions
              graphCtrl.addGraph(drawHearts, pos);


            };

            function drawSleep() {
              if (sleepScale) {
                xScale.domain(sleepScale);
                yScale.domain([0, 4]);
                yAxisGen.tickFormat(sleepFormat);

                var t = content.transition().duration(3500);
                t.select(".x.axis").style("opacity", 1).call(xAxisGen);
                t.select(".y.axis").style("opacity", 1).call(yAxisGen);
                t.select(".text").style("opacity", 1);
                d3.select(".nodata").style("opacity", 0);
                t.selectAll("rect.steps").attr("y", function (d, i) {
                    return height - yScale(d.value);
                  })
                  .attr("height", function (d, i) {
                    return 0;
                  });
              } else {
                d3.select(".nodata").style("opacity", 1);

              }


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

              var area = d3.svg.area()
                .interpolate("monotone")
                .x(function (d) {
                  return xScale2(d.time);
                })
                .y0(height2)
                .y1(function (d) {
                  return yScale2(d.value);
                });

              /*var overview = svg.selectAll("path.area").attr("d", function (d) {
               //console.log(d.values);
               return area(d.values);
               });*/

              var path = d3.selectAll("path.sleep").attr("d", function (d) {
                //console.log(d.values);
                return line(d.values);
              });
              if (path.node() != null) {
                var sleepLength = path.node().getTotalLength();
                path
                  .attr("stroke-dasharray", sleepLength + " " + sleepLength)
                  .attr("stroke-dashoffset", sleepLength)
                  .transition()
                  .duration(2000)
                  .ease("linear")
                  .attr("stroke-dashoffset", 0).style("opacity", 1);
              }

              var stepsPath = d3.selectAll("path.steps-1");
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

            function drawMorning() {
              console.log("drawMorning");
              if (stepsXScale) {
                xScale.domain(stepsXScale);
                yScale.domain(stepsYScale);
                console.log(xScale.domain())
                yAxisGen.tickFormat(yScale.tickFormat(10));
                var t = d3.transition().transition().duration(3500);
                t.select(".x.axis").style("opacity", 1).call(xAxisGen);
                t.select(".y.axis").style("opacity", 1).call(yAxisGen);
                //t.selectAll(".step").style("opacity",1);
                //t.select(".text").style("opacity", 0);
                d3.select(".nodata").style("opacity", 0);
                t.selectAll("rect.step-1").attr("y", function (d, i) {
                    return height - yScale(d.value);
                  })
                  .attr("height", function (d, i) {
                    return yScale(d.value);
                  });
              } else {
                d3.select(".nodata").style("opacity", 1);

              }
              /*
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
               if (stepsPath.node() != null) {

               var totalLength = stepsPath.node().getTotalLength();
               stepsPath
               .attr("stroke-dasharray", totalLength + " " + totalLength)
               .attr("stroke-dashoffset", totalLength)
               .transition()
               .duration(2000)
               .ease("linear")
               .attr("stroke-dashoffset", 0);
               }*/

              var sleepsPath = d3.selectAll("path.sleep");
              if (sleepsPath.node() != null) {
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
              if (heartsXScale) {
                xScale.domain(heartsXScale);
                yScale.domain(heartsYScale);
                //yAxisGen.tickFormat(sleepFormat);

                var t = content.transition().duration(3500);
                t.select(".x.axis").style("opacity", 1).call(xAxisGen);
                t.select(".y.axis").style("opacity", 1).call(yAxisGen);
                t.select(".text").style("opacity", 0);
                d3.select(".nodata").style("opacity", 0);
                t.selectAll("rect.steps").attr("y", function (d, i) {
                    return height - yScale(d.value);
                  })
                  .attr("height", function (d, i) {
                    return 0;
                  });
                t.selectAll("rect.step").attr("y", function (d, i) {
                    return height - yScale(d.value);
                  })
                  .attr("height", function (d, i) {
                    return 0;
                  });

              } else {
                d3.select(".nodata").style("opacity", 1);

              }

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

              if (hrPath.node != null) {
                var totalLength = hrPath.node().getTotalLength();
                hrPath
                  .attr("stroke-dasharray", totalLength + " " + totalLength)
                  .attr("stroke-dashoffset", totalLength)
                  .transition()
                  .duration(2000)
                  .ease("linear")
                  .attr("stroke-dashoffset", 0);
              }
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

            function drawLunch() {
              console.log("drawLunch");
              if (stepsXScale2) {
                xScale.domain(stepsXScale2);
                yScale.domain(stepsYScale2);
                console.log(stepsXScale2);
                yAxisGen.tickFormat(yScale.tickFormat(10));
                var t = d3.transition().transition().duration(3500);
                t.select(".x.axis").style("opacity", 1).call(xAxisGen);
                t.select(".y.axis").style("opacity", 1).call(yAxisGen);
                //t.selectAll(".step").style("opacity",1);
                //t.select(".text").style("opacity", 0);
                d3.select(".nodata").style("opacity", 0);
                t.selectAll("rect.step-3").attr("y", function (d, i) {
                    return height - yScale(d.value);
                  })
                  .attr("height", function (d, i) {
                    return yScale(d.value);
                  });
              } else {
                d3.select(".nodata").style("opacity", 1);

              }
              /*
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
               if (stepsPath.node() != null) {

               var totalLength = stepsPath.node().getTotalLength();
               stepsPath
               .attr("stroke-dasharray", totalLength + " " + totalLength)
               .attr("stroke-dashoffset", totalLength)
               .transition()
               .duration(2000)
               .ease("linear")
               .attr("stroke-dashoffset", 0);
               }*/


              var sleepsPath = d3.selectAll("path.sleep");
              if (sleepsPath.node() != null) {
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
                heartsData = [];
              } else {
                if (newVal.length > 0) {
                  //console.log(newVal);
                  scope.renderHearts(newVal, 2, heartsData);
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
                  //scope.renderSteps(newVal);
                  //clean up steps
                  content.selectAll(".steps").remove();
                  scope.renderSteps(newVal, 1, stepsData);
                  scope.renderSteps(newVal, 3, stepsData2);

                }
              }

            });
            //init all functions
            graphCtrl.addGraph(drawSleep, 0);
            graphCtrl.addGraph(drawMorning, 1);
            graphCtrl.addGraph(drawHearts, 2);
            graphCtrl.addGraph(drawLunch, 3)
            drawNoData('graphsvg');

            scope.$watchCollection('data', function (newVal, oldVal) {
              //console.log(newVal);
            });

            function drawNoData(canvas_div_name) {

              var div_width = $('#' + canvas_div_name).width();
              var div_height = 400;

              var svg = d3.select('#' + canvas_div_name).append("svg")
                .attr("class", "nodatasvg")
                .attr("width", div_width)
                .attr("height", div_height)
                .attr("preserveAspectRatio", "xMidYMid")
                .append("g")
                .attr("transform", "translate(" + (div_width / 2 - 50) + "," + (div_height / 2 - 50) + ")");

              svg.append("text")
                .attr("class", "nodata")
                .text("No Data")
                .style("font-size", "40px")
                .style("opacity", 0);
            }

          }
        );

      }
    }
      ;
  }])
;
