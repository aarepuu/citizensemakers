'use strict';

angular.module('charts')
  .directive('columnChart', ['d3Service', function (d3Service) {


    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="chart"></div>',
      scope: {
        height: '=height',
        data: '=data',
        hovered: '&hovered'
      },
      link: function (scope, element, attrs) {
        d3Service.d3().then(function (d3) {


          d3.custom = {};

          d3.custom.barChart = function module() {
            var margin = {top: 20, right: 20, bottom: 40, left: 40},
              width = 500,
              height = 500,
              gap = 0,
              ease = 'cubic-in-out';
            var svg, duration = 500;

            var dispatch = d3.dispatch('customHover');
            function exports(_selection) {
              _selection.each(function(_data) {

                var chartW = width - margin.left - margin.right,
                  chartH = height - margin.top - margin.bottom;

                var x1 = d3.scale.ordinal()
                  .domain(_data.map(function(d, i){ return i; }))
                  .rangeRoundBands([0, chartW], .1);

                var y1 = d3.scale.linear()
                  .domain([0, d3.max(_data, function(d, i){ return d; })])
                  .range([chartH, 0]);

                var xAxis = d3.svg.axis()
                  .scale(x1)
                  .orient('bottom');

                var yAxis = d3.svg.axis()
                  .scale(y1)
                  .orient('left');

                var barW = chartW / _data.length;

                if(!svg) {
                  svg = d3.select(this)
                    .append('svg')
                    .classed('chart', true);
                  var container = svg.append('g').classed('container-group', true);
                  container.append('g').classed('chart-group', true);
                  container.append('g').classed('x-axis-group axis', true);
                  container.append('g').classed('y-axis-group axis', true);
                }

                svg.transition().duration(duration).attr({width: width, height: height})
                svg.select('.container-group')
                  .attr({transform: 'translate(' + margin.left + ',' + margin.top + ')'});

                svg.select('.x-axis-group.axis')
                  .transition()
                  .duration(duration)
                  .ease(ease)
                  .attr({transform: 'translate(0,' + (chartH) + ')'})
                  .call(xAxis);

                svg.select('.y-axis-group.axis')
                  .transition()
                  .duration(duration)
                  .ease(ease)
                  .call(yAxis);

                var gapSize = x1.rangeBand() / 100 * gap;
                var barW = x1.rangeBand() - gapSize;
                var bars = svg.select('.chart-group')
                  .selectAll('.bar')
                  .data(_data);
                bars.enter().append('rect')
                  .classed('bar', true)
                  .attr({x: chartW,
                    width: barW,
                    y: function(d, i) { return y1(d); },
                    height: function(d, i) { return chartH - y1(d); }
                  })
                  .on('mouseover', dispatch.customHover);
                bars.transition()
                  .duration(duration)
                  .ease(ease)
                  .attr({
                    width: barW,
                    x: function(d, i) { return x1(i) + gapSize/2; },
                    y: function(d, i) { return y1(d); },
                    height: function(d, i) { return chartH - y1(d); }
                  });
                bars.exit().transition().style({opacity: 0}).remove();

                duration = 500;

              });
            }
            exports.width = function(_x) {
              if (!arguments.length) return width;
              width = parseInt(_x);
              return this;
            };
            exports.height = function(_x) {
              if (!arguments.length) return height;
              height = parseInt(_x);
              duration = 0;
              return this;
            };
            exports.gap = function(_x) {
              if (!arguments.length) return gap;
              gap = _x;
              return this;
            };
            exports.ease = function(_x) {
              if (!arguments.length) return ease;
              ease = _x;
              return this;
            };
            d3.rebind(exports, dispatch, 'on');
            return exports;
          };
          var chart = d3.custom.barChart();
          var chartEl = d3.select(element[0]);
          chart.on('customHover', function (d, i) {
            scope.hovered({args: d});
          });

          scope.$watch('data', function (newVal, oldVal) {
            chartEl.datum(newVal).call(chart);
          });

          scope.$watch('height', function (d, i) {
            chartEl.call(chart.height(scope.height));
          })
        });
      }
    };
  }]).directive('chartForm', function () {
  return {
    restrict: 'E',
    replace: true,
    controller: function AppCtrl($scope) {
      $scope.update = function (d, i) {
        $scope.data = randomData();
      };
      function randomData() {
        return d3.range(~~(Math.random() * 50) + 1).map(function (d, i) {
          return ~~(Math.random() * 1000);
        });
      }
    },
    template: '<div class="form">' +
    'Height: {{vm.options.height}}<br />' +
    '<input type="range" ng-model="vm.options.height" min="100" max="800"/>' +
    '<br /><button ng-click="update()">Update Data</button>' +
    '<br />Hovered bar data: {{vm.barValue}}</div>'
  }
});
