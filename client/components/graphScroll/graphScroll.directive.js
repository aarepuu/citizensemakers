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
        $scope.activeStep = 0;
        d3Service.d3().then(function (d3) {

          function graphScroll() {

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
          self.getActiveStep = function () {
            return $scope.activeStep;
          };

          function setChartScale() {
            var width = $window.innerWidth - (280 * 2);
            //console.log(width);
            width = (width > 960) ? 960 : width;
            var height = 500;

            //   .style('transform', 'scale(' + width / 960 + ')')
            // .attr("width", width)
            // .attr("height", height)


            d3.select('#graph')
              .style('transform', 'scale(' + width / (280 * 2) + ')')
              .style('-webkit-transform', 'scale(' + width / (280 * 2) + ')')
              .style('-moz-transform', 'scale(' + width / (280 * 2) + ')')
              .style('-o-transform', 'scale(' + width / (280 * 2) + ')')
              .style('-ms-transform', 'scale(' + width / (280 * 2) + ')');


            //setTimeout(function() { updateFunctions[0](); }, 2000);

            // -webkit-transform-origin : 50% 100%;
            // -moz-transform-origin : 50% 100%;
            // -o-transform-origin : 50% 100%;
            // -ms-transform-origin : 50% 100%;
            // transform-origin : 50% 100%;


            // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            // .style('margin-left', -(960 - width) / 2 + 'px')
            // .style('margin-top', -(960 - width) / 3 + 'px')

            // var graphh = d3.select('#graph');
            //
            // graphh[0][0].childNodes[0]
            //   .attr("xmlns", "http://www.w3.org/2000/svg")
            //   .attr("width", width)
            //   .attr("height", height);


            // .style('transform', 'scale(' + width / 960 + ')')
            // .style('-webkit-transform', 'scale(' + width / 960 + ')')
            // .style('-moz-transform', 'scale(' + width / 960 + ')')
            // .style('-o-transform', 'scale(' + width / 960 + ')')
            // .style('-ms-transform', 'scale(' + width / 960 + ')');

            // var width = Math.min(960, $window.innerWidth - 240)
            // d3.select('#graph')
            //   .style('transform', 'scale(' + width / 960 + ')')
            //   .style('-webkit-transform', 'scale(' + width / 960 + ')')
            //   .style('-moz-transform', 'scale(' + width / 960 + ')')
            //   .style('-o-transform', 'scale(' + width / 960 + ')')
            //   .style('-ms-transform', 'scale(' + width / 960 + ')')
            //   .style('margin-left', -(960 - width) / 2 + 'px')
            //   .style('margin-top', -(960 - width) / 3 + 'px')

          }

          //d3.select($window).on('resize.calcScale', _.debounce(setChartScale, 200))
          //setChartScale();


          //TODO - not a good way, make dynamic;
          $scope.$watch('ready', function (val) {
            //early return hack when comments are not ready
            if (val != 2) return;
            var lastI = -1
            graphScroll()
              .container(d3.select('.container-fluid'))
              .graph(d3.selectAll('#graph'))
              .rightsections(d3.selectAll('#sections2 > section'))
              .leftsections(d3.selectAll('#sections > section'))
              .on('active', function (i) {
                $scope.activeStep = i;
                //animation for sections
                d3.selectAll('#sections > section')
                  .transition().duration(function (d, i) {
                    return i == $scope.activeStep ? 0 : 600
                  })
                  .style('opacity', function (d, i) {
                    return i == $scope.activeStep ? 1 : i == $scope.activeStep + 1 ? .2 : .001
                  });
                //call all fns last and active index
                if (updateFunctions.length === 0 || typeof (updateFunctions[i]) == 'undefined') return;
                var sign = $scope.activeStep - lastI < 0 ? -1 : 1
                d3.range(lastI + sign, $scope.activeStep + sign, sign).forEach(function (i) {
                  updateFunctions[i]()
                });
                lastI = $scope.activeStep
                //$scope.activeStep = activeI;
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
        interpolate: '=?',
        extent: '=?'
      },
      link: function (scope, element, attrs, graphCtrl) {
        d3Service.d3().then(function (d3) {
            var xScale, yScale, xScale2, yScale2, xAxisGen, xAxisGen2,
              yAxisGen, color, brush, content, overview, sleepScale,
              stepsXScale, stepsYScale, stepsXScale2, stepsYScale2, stepsXScale3, stepsYScale3,
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
            var colours = [];

            var margin = {top: 10, right: 10, bottom: 100, left: 40},
              margin2 = {top: 430, right: 10, bottom: 20, left: 40},
              width = ($window.innerWidth - (280 * 2)) - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom,
              height2 = 500 - margin2.top - margin2.bottom;


            //TODO - make this element reference better
            var rawSvg = element.find('svg');
            var svg = d3.select(rawSvg[0])
              .attr("xmlns", "http://www.w3.org/2000/svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);


            function render() {
              //console.log("RENDER");
              //get dimensions based on window size
              var windowWidth = ($window.innerWidth - (280 * 2) > 960) ? 960 : ($window.innerWidth - (280 * 2));
              //console.log(windowWidth);
              updateDimensions(windowWidth);

              //update x and y scales to new dimensions
              xScale.range([0, width]);
              yScale.range([height, 0]);

              //update svg elements to new dimensions
              svg
                .attr('width', width + margin.right + margin.left)
                .attr('height', height + margin.top + margin.bottom);
              content.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


              //update the axis and other components
              xAxisGen.scale(xScale);
              yAxisGen.scale(yScale);
              brush.x(xScale);

              svg.select('.x.axis')
                .attr('transform', 'translate(0,' + height + ')');


              renderCurrentChart();

              //Update brush position and text
              content.select(".brush").selectAll("rect").attr("y", -6)
                .attr("height", height + 7);

              content.select(".chart-title")
                .attr("x", width / 2)
                .attr("y", height + (margin.bottom / 2));

              content.select(".nodata").attr("transform", "translate(" + (width / 2 - 220) + "," + (height / 2) + ")")

              //path.attr('d', line);
            }

            function updateDimensions(winWidth) {
              margin.top = 10;
              margin.right = 10;
              margin.left = 40;
              margin.bottom = 100;


              width = winWidth - margin.left - margin.right;
              //height = 500 - margin.top - margin.bottom;
              height = .5 * width;
            }


            xScale = d3.time.scale()
              .range([0, width]);
            xScale2 = d3.time.scale()
              .range([0, width]);

            yScale = d3.scale.linear()
              .range([height, 0]);
            yScale2 = d3.scale.linear()
              .range([height2, 0]);

            xAxisGen = d3.svg.axis()
              .ticks(20)
              .scale(xScale)
              //.tickSize(-(width), 0)
              .tickPadding(6)
              .orient("bottom");

            yAxisGen = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .innerTickSize(-width)
              .outerTickSize(0)
              .tickPadding(10);

            xAxisGen2 = d3.svg.axis()
              .scale(xScale2)
              .orient("bottom")
              .tickSize(height2, 0);

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

            // add brush
            brush = d3.svg.brush()
              .x(xScale)
              .on("brush", brushed);


            color = d3.scale.ordinal();
            function getUserColor(n) {
              return colours[n];
            }

            //canvas for the d3 stuff
            content = svg.append("g")
              .attr("id", "content")
              .attr("class", "content")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //overview chart
            overview = svg.append("g")
              .attr("id", "overview")
              .attr("class", "overview")
              .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

            //x axis for overview
            overview.append("g")
              .attr("class", "x axis")
            //.attr("transform", "translate(0," + height2 + ")")


            // x axis for the main content
            content.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")");


            // y axis
            content.append("g")
              .attr("class", "y axis")
              //.attr("transform", "translate(20,0)")
              .append("text")
              //.attr("transform", "rotate(-90)")
              //.attr("y", 6)
              //.attr("dy", ".31em")
              .attr("class", "title")
              .attr("dx", "-.31em")
              .style("text-anchor", "end")
              .style("opacity", 0);


            //add brush
            content.append("g")
              .attr("class", "x brush")
              .call(brush)
              .selectAll("rect")
              .attr("y", -6)
              .attr("height", height + 7);

            content.append("text")
              .attr("class", "chart-title")
              .attr("x", width / 2)
              .attr("y", height + (margin.bottom / 2))
              .attr("text-anchor", "middle")
              .style("opacity", 0);

            //Render graph based on incoming 'data'
            scope.renderSleep = function (data, pos, database) {
              var userColor = data.color;
              var data = JSON.parse(JSON.stringify(data.data));
              //process data
              var index = users1.indexOf(data[data.length - 1].user);
              //Check if we have to remove data
              if (data[data.length - 1].remove) {
                if (index != -1) {
                  users1.splice(index, 1);
                  //TODO - make more generic
                  filterOut(database, data[data.length - 1].user);
                } else {
                  return;
                }
              } else {
                //proccess data
                data.forEach(function (d) {
                  d.time = moment(d.time * 1000);
                });
                users1.push(data[data.length - 1].user);
                colours[data[data.length - 1].user] = userColor;
                database.push({user: data[data.length - 1].user, values: data});
              }

              //Set our scale's domains
              //different colors for users
              color.domain(users1);

              sleepScale = [
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
              //sleep is first graph, so set domains
              xScale.domain(sleepScale);
              yScale.domain([0, 4]);

              d3.select('#people > svg').remove();

              //Legend for all the charts
              //TODO - make it stuck and make it into a menu
              /*
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
               return getUserColor(d)
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

               */
              // remove data before rendering
              content.selectAll(".step-" + pos).remove();

              var sleep = content.selectAll(".step-" + pos)
                .data(database)
                .enter().append("g")
                .attr("class", "sleep step-" + pos)


              sleep.append("path")
                .attr("class", function (d) {
                  return "sleep step-" + pos + " sleep" + d.user;
                })
                .attr("id", function (d) {
                  return "sleep" + d.user;
                })
                .style("stroke", function (d) {
                  return getUserColor(d.user);
                })
                .style("opacity", 1);


              overview.append("path")
                .data(heartsData)
                .attr("class", "area")
                .attr("id", "hrarea")
              //.attr("d", area);

              //add functions
              graphCtrl.addGraph(drawSleep, 0);


              render();

            };


            //Render graph based on incoming 'data'
            scope.renderSteps = function (data, pos, database) {
              var userColor = data.color;
              var data = JSON.parse(JSON.stringify(data.data));
              // process data
              var index = users2.indexOf(data[data.length - 1].user);
              //Check if we have to remove data
              if (data[data.length - 1].remove) {
                if (index != -1) {
                  users2.splice(index, 1);
                }
                //TODO - make more generic
                filterOut(database, data[data.length - 1].user);


              } else {
                //proccess data
                data.forEach(function (d) {
                  d.time = moment(d.time * 1000);
                });
                if (pos == 1) {
                  var cutoffDate = moment(data[data.length - 1].time).hour(9).minute(0);
                  data = data.filter(function (d) {
                    return d.time < cutoffDate;
                  });
                  if (data.length == 0) return;

                  database.push({user: data[data.length - 1].user, values: data});

                } else if (pos == 3) {
                  var startDate = moment(data[data.length - 1].time).hour(12).minute(0);
                  var endDate = moment(data[data.length - 1].time).hour(14).minute(0);
                  data = data.filter(function (d) {
                    return (d.time >= startDate) && (d.time <= endDate);
                  });
                  if (data.length == 0) return;

                  database.push({user: data[data.length - 1].user, values: data});
                } else if (pos == 5) {
                  var startDate = moment(data[data.length - 1].time).hour(17).minute(0);
                  var endDate = moment(data[data.length - 1].time).hour(23).minute(0);
                  data = data.filter(function (d) {
                    return (d.time >= startDate) && (d.time <= endDate);
                  });
                  if (data.length == 0) return;

                  database.push({user: data[data.length - 1].user, values: data});
                }
                if (index == -1) {
                  users2.push(data[data.length - 1].user);
                  colours[data[data.length - 1].user] = userColor;
                }
              }


              if (pos == 1) {
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
              } else if (pos == 5) {
                stepsXScale3 = [
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
                stepsYScale3 = [
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
                xScale.domain(stepsXScale3);
                yScale.domain(stepsYScale3);
              }

              //Rewrite domain
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
                  return getUserColor(d.user);
                });


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
              } else if (pos == 5) {
                graphCtrl.addGraph(drawEvening, pos);
              }

              render();

            };

            //Render graph based on incoming 'data'
            scope.renderHearts = function (data, pos, database) {
              var userColor = data.color;
              var data = JSON.parse(JSON.stringify(data.data));
              // process data
              var index = users3.indexOf(data[data.length - 1].user);
              //Check if we have to remove data
              if (data[data.length - 1].remove) {
                if (index != -1) {
                  users3.splice(index, 1);
                }
                //TODO - make more generic
                filterOut(database, data[data.length - 1].user);
              } else {
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

                } else if (pos == 4) {
                  var startDate = moment(data[data.length - 1].time).hour(14).minute(0);
                  var endDate = moment(data[data.length - 1].time).hour(17).minute(0);
                  data = data.filter(function (d) {
                    return (d.time >= startDate) && (d.time <= endDate);
                  });

                  if (data.length == 0) return;
                  database.push({user: data[data.length - 1].user, values: data});

                }
                if (index == -1) {
                  users3.push(data[data.length - 1].user);
                  colours[data[data.length - 1].user] = userColor;
                }
              }

              if (pos == 2) {
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
              } else if (pos == 4) {
                heartsXScale2 = [
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

                heartsYScale2 = [
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
                  return getUserColor(d.user);
                })
                .style("opacity", 0);


              //add functions
              if (pos == 2) {
                graphCtrl.addGraph(drawHrMorning, pos);
              } else if (pos == 4) {
                graphCtrl.addGraph(drawAfternoon, pos);
              }

              render();


            };

            function drawSleep() {
              var t = d3.transition().transition().duration(2500);
              content.selectAll("rect.steps").transition().duration(600)
                .attr("height", function (d, i) {
                  0
                });

              users3.forEach(function (d, i) {
                var hrPath = d3.select("path.hr.line" + d);
                if (hrPath.node() != null) {
                  var totalLength = hrPath.node().getTotalLength();

                  hrPath
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength).style("opacity", 0);

                }
              });

              t.select(".chart-title").text("Sleep from " + $('.date-picker--ui').attr("name")).style("opacity", 1);
              if (sleepScale) {
                xScale.domain(sleepScale);
                //xScale2.domain(heartsXScale);
                yScale.domain([0, 4]);
                yAxisGen.tickFormat(sleepFormat);
                d3.select(".y.axis").style("opacity", 1);
                d3.select(".x.axis").style("opacity", 1);
                t.select(".x.axis").call(xAxisGen);
                t.select(".y.axis").call(yAxisGen);
                t.select(".y.axis text").text("Stage").style("opacity", 1);
                d3.select(".nodata").style("opacity", 0);
                d3.select(".brush").style("opacity", 1);
                //overview.select(".x.axis").call(xAxisGen2);
              } else {
                chartNoData();
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

              var over = svg.selectAll("path.area").attr("d", function (d) {
                //console.log(d.values);
                return area(d.values);
              });

              users1.forEach(function (d, i) {
                var path = d3.select("path.sleep" + d).attr("d", function (d) {
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
              });

              users3.forEach(function (d, i) {
                var hrPath = d3.selectAll("path.hr.line" + d);
                if (hrPath.node() != null) {
                  var totalLength = hrPath.node().getTotalLength();

                  hrPath
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength).style("opacity", 0);

                }
              });

              //default brush
              brush.extent(xScale.domain());
              brush(d3.select(".brush").transition());
              brush.event(d3.select(".brush").transition().delay(1000))

            }

            function drawMorning() {
              var t = d3.transition().transition().duration(2500);
              content.selectAll("rect.steps").transition().duration(600)
                .attr("height", function (d, i) {
                  0
                });
              t.select(".chart-title").text("Morning actvities").style("opacity", 1);
              if (stepsXScale) {
                xScale.domain(stepsXScale);
                yScale.domain(stepsYScale);
                yAxisGen.tickFormat(yScale.tickFormat(10));
                d3.select(".y.axis").style("opacity", 1);
                d3.select(".x.axis").style("opacity", 1);
                t.select(".x.axis").call(xAxisGen);
                t.select(".y.axis").call(yAxisGen);
                t.select(".y.axis text").text("Steps").style("opacity", 1);
                t.select(".brush").style("opacity", 1);

                d3.select(".nodata").style("opacity", 0);

                content.selectAll("rect.step-1").transition()
                  .delay(function (d, i) {
                    return 20 * (i + 1);
                  })
                  .duration(600)
                  .attr("height", function (d) {
                    return yScale(d.value);
                  }).attr("y", function (d, i) {
                  return height - yScale(d.value);
                }).attr("x", function (d, i) {
                  return xScale(d.time);
                });
              } else {
                chartNoData();
              }


              users1.forEach(function (d, i) {
                var sleepPath = d3.select("path.sleep" + d);
                if (sleepPath.node() != null) {
                  var totalLength = sleepPath.node().getTotalLength();
                  sleepPath
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength).style("opacity", 0);

                }
              });

              users3.forEach(function (d, i) {
                var hrPath = d3.selectAll("path.hr.line" + d);
                if (hrPath.node() != null) {
                  var totalLength = hrPath.node().getTotalLength();

                  hrPath
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength).style("opacity", 0);

                }
              });

            }

            function drawHrMorning() {
              var t = d3.transition().transition().duration(2500);
              content.selectAll("rect.steps").transition().duration(600)
                .attr("height", function (d, i) {
                  0
                });
              t.select(".chart-title").text("Morning heart rate").style("opacity", 1);
              if (heartsXScale) {
                xScale.domain(heartsXScale);
                yScale.domain(heartsYScale);
                d3.select(".y.axis").style("opacity", 1);
                d3.select(".x.axis").style("opacity", 1);
                t.select(".x.axis").call(xAxisGen);
                t.select(".y.axis").call(yAxisGen);
                t.select(".y.axis text").text("Bpm").style("opacity", 1);
                d3.select(".nodata").style("opacity", 0);
                d3.select(".brush").style("opacity", 1);
              } else {
                chartNoData();
              }

              var line = d3.svg.line()
                .x(function (d) {
                  return xScale(d.time);
                })
                .y(function (d) {
                  return yScale(d.value);
                }).interpolate('basis');

              users1.forEach(function (d, i) {
                var sleepPath = d3.select("path.sleep" + d);
                if (sleepPath.node() != null) {
                  var totalLength = sleepPath.node().getTotalLength();
                  sleepPath
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength).style("opacity", 0);

                }
              });


              users3.forEach(function (d, i) {
                var path = d3.select("path.step-2.line" + d).attr("d", function (d) {
                  //console.log(d.values);
                  return line(d.values);
                });

                if (path.node() != null) {
                  var pathLenght = path.node().getTotalLength();
                  path
                    .attr("stroke-dasharray", pathLenght + " " + pathLenght)
                    .attr("stroke-dashoffset", pathLenght)
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0).style("opacity", 1);
                }
              });
            }

            function drawLunch() {
              var t = d3.transition().transition().duration(2500);

              content.selectAll("rect.steps").transition().duration(600)
                .attr("height", function (d, i) {
                  0
                });

              t.select(".chart-title").text("Lunchtime activities").style("opacity", 1);
              if (stepsXScale2) {
                xScale.domain(stepsXScale2);
                yScale.domain(stepsYScale2);
                yAxisGen.tickFormat(yScale.tickFormat(10));
                d3.select(".y.axis").style("opacity", 1);
                d3.select(".x.axis").style("opacity", 1);
                t.select(".x.axis").call(xAxisGen);
                t.select(".y.axis").call(yAxisGen);
                t.select(".y.axis text").text("Steps").style("opacity", 1);
                //t.selectAll(".step").style("opacity",1);
                //t.select(".text").style("opacity", 0);
                d3.select(".brush").style("opacity", 1);
                d3.select(".nodata").style("opacity", 0);
                content.selectAll("rect.step-3").transition()
                  .delay(function (d, i) {
                    return 20 * (i + 1);
                  })
                  .duration(600)
                  .attr("height", function (d) {
                    return yScale(d.value);
                  }).attr("y", function (d, i) {
                  return height - yScale(d.value);
                }).attr("x", function (d, i) {
                  return xScale(d.time);
                });
              } else {
                chartNoData();
              }
              users3.forEach(function (d, i) {
                var path = d3.selectAll("path.hr.line" + d);

                if (path.node() != null) {
                  var pathLenght = path.node().getTotalLength();
                  path
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", pathLenght).style("opacity", 0);
                }
              });
              users1.forEach(function (d, i) {
                var sleepPath = d3.select("path.sleep" + d);
                if (sleepPath.node() != null) {
                  var totalLength = sleepPath.node().getTotalLength();
                  sleepPath
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength).style("opacity", 0);

                }
              });

            }

            function drawAfternoon() {
              var t = d3.transition().transition().duration(2500);
              content.selectAll("rect.steps").transition().duration(600)
                .attr("height", function (d, i) {
                  0
                });
              t.select(".chart-title").text("Afternoon heart rate").style("opacity", 1);
              if (heartsXScale2) {
                xScale.domain(heartsXScale2);
                yScale.domain(heartsYScale2);
                //yAxisGen.tickFormat(sleepFormat);
                d3.select(".y.axis").style("opacity", 1);
                d3.select(".x.axis").style("opacity", 1);
                t.select(".x.axis").call(xAxisGen);
                t.select(".y.axis").call(yAxisGen);
                t.select(".y.axis text").text("Bpm").style("opacity", 1);
                d3.select(".brush").style("opacity", 1);
                d3.select(".nodata").style("opacity", 0);
              } else {
                chartNoData();
              }

              var line = d3.svg.line()
                .x(function (d) {
                  return xScale(d.time);
                })
                .y(function (d) {
                  return yScale(d.value);
                }).interpolate('basis');

              var hrPath = d3.selectAll("path.step-4").attr("d", function (d) {
                //console.log(d.values);
                return line(d.values);
              }).style("opacity", 1);

              if (hrPath.node() != null) {
                var totalLength = hrPath.node().getTotalLength();
                hrPath
                  .attr("stroke-dasharray", totalLength + " " + totalLength)
                  .attr("stroke-dashoffset", totalLength)
                  .transition()
                  .duration(2000)
                  .ease("linear")
                  .attr("stroke-dashoffset", 0);
              }


            }

            function drawEvening() {
              var t = d3.transition().transition().duration(2500);
              content.selectAll("rect.steps").transition().duration(600)
                .attr("height", function (d, i) {
                  0
                });
              t.select(".chart-title").text("Evening activities").style("opacity", 1);
              if (stepsXScale3) {
                xScale.domain(stepsXScale3);
                yScale.domain(stepsYScale3);
                yAxisGen.tickFormat(yScale.tickFormat(10));
                d3.select(".y.axis").style("opacity", 1);
                d3.select(".x.axis").style("opacity", 1);
                t.select(".x.axis").call(xAxisGen);
                t.select(".y.axis").call(yAxisGen);
                t.select(".y.axis text").text("Steps").style("opacity", 1);
                d3.select(".brush").style("opacity", 1);
                d3.select(".nodata").style("opacity", 0);
                content.selectAll("rect.step-5").transition()
                  .delay(function (d, i) {
                    return 20 * (i + 1);
                  })
                  .duration(600)
                  .attr("height", function (d) {
                    return yScale(d.value);
                  }).attr("y", function (d, i) {
                  return height - yScale(d.value);
                }).attr("x", function (d, i) {
                  return xScale(d.time);
                });
              } else {
                chartNoData();
              }


              users1.forEach(function (d, i) {
                var sleepPath = d3.select("path.sleep" + d);
                if (sleepPath.node() != null) {
                  var totalLength = sleepPath.node().getTotalLength();
                  sleepPath
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength).style("opacity", 0);

                }
              });

              users3.forEach(function (d, i) {
                var hrPath = d3.selectAll("path.hr.line" + d);
                if (hrPath.node() != null) {
                  var totalLength = hrPath.node().getTotalLength();

                  hrPath
                    .transition()
                    .duration(2000)
                    .ease("linear")
                    .attr("stroke-dashoffset", totalLength).style("opacity", 0);

                }
              });
            }


            function brushed() {
              scope.brushed({args: brush.extent()});
            }

            function filterOut(items, search) {
              for (var i = 0; i < items.length; i++) {
                if (items[i].user == search) {
                  items.splice(i, 1);
                  break;
                }
              }
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
              if (newVal === [] || typeof newVal === 'undefined') {
                users3 = [];
                heartsData = [];
                heartsData2 = [];
                heartsData3 = [];
              } else {
                scope.renderHearts(newVal, 2, heartsData);
                scope.renderHearts(newVal, 4, heartsData2);
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
                scope.renderSleep(newVal, 0, sleepData);
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
                stepsData2 = [];
                stepsData3 = [];
              } else {
                scope.renderSteps(newVal, 1, stepsData);
                scope.renderSteps(newVal, 3, stepsData2);
                scope.renderSteps(newVal, 5, stepsData3);
              }

            });
            //init all functions
            graphCtrl.addGraph(drawSleep, 0);
            graphCtrl.addGraph(drawMorning, 1);
            graphCtrl.addGraph(drawHrMorning, 2);
            graphCtrl.addGraph(drawLunch, 3);
            graphCtrl.addGraph(drawAfternoon, 4);
            graphCtrl.addGraph(drawEvening, 5);
            drawNoData('graphsvg');

            scope.$watch('extent', function (newVal, oldVal) {
              //console.log(newVal);
              if (newVal != 0) {
                brush.extent([moment(newVal[0]), moment(newVal[1])]);
                brush(d3.select(".brush").transition());
                brush.event(d3.select(".brush").transition().delay(1000))
              }
            });

            function drawNoData(canvas_div_name) {


              content.append("g")

                .append("text")
                .attr("class", "nodata")
                //.attr("transform", "translate(" + (width / 2 - 30) + "," + (height / 2 - 30) + ")")
                .text("No data to display at this point, scroll up or down")
                .style("font-size", "20px")
                .style("opacity", 0);
            }

            function chartNoData() {
              d3.select(".nodata").style("opacity", 1);
              d3.select(".y.axis").style("opacity", 0);
              d3.select(".x.axis").style("opacity", 0);
              d3.select(".brush").style("opacity", 0);
              //d3.select(".chart-title").style("opacity", 0);
              d3.select(".y.axis text").style("opacity", 0);
            }

            function renderCurrentChart() {
              if (graphCtrl.getActiveStep() == 0) {
                drawSleep();
              } else if (graphCtrl.getActiveStep() == 1) {
                drawMorning();
              } else if (graphCtrl.getActiveStep() == 3) {
                drawLunch();
              } else if (graphCtrl.getActiveStep() == 5) {
                drawEvening();
              } else if (graphCtrl.getActiveStep() == 2) {
                drawHrMorning();
              } else if (graphCtrl.getActiveStep() == 4) {
                drawAfternoon();
              }
            }

            d3.select($window).on('resize.calcScale', _.debounce(render, 200));
            //d3.select($window).on('resize', render());


          }
        );

      }
    }
      ;
  }])
;
