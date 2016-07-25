'use strict';

(function () {

  class DataController {


    constructor($http, $scope, Auth, amMoment) {
      this.Auth = Auth;
      this.$scope = $scope;
      this.$http = $http;
      this.startDate = null;
      this.endDate = null;
      this.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      this.monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      this.weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      this.weekdaysLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      this.disable = [false, 1, 7];
      this.today = 'Today';
      this.clear = 'Clear';
      this.close = 'Close';
      this.days = 15;
      this.graphData = null;
      this.interpolate = 'monotone';
      this.slider = {
        minValue: 10,
        maxValue: 90,
        options: {
          floor: 0,
          ceil: 100,
          step: 1
        }
      };

      this.options = {width: 500, height: 300, 'bar': 'aaa'};

      this.data = [1, 2, 3, 4];

      this.barValue = 'None';
      this.currentCalValues = [];
      this.brushValue = null;
      this.users = [];

    }

    //oninit doesn't work on onepage apps
    init() {
      this.getCurrentUser = this.Auth.getCurrentUser;
      this.fitbitId = this.getCurrentUser().fitbitId;
      this.userId = this.getCurrentUser()._id;
      //TODO - change the names of right arrays. make it more explicit
      this.rights = this.getCurrentUser().rights.them;

      //default comment
      this.defaultcomment = {
        _id: null,
        user: this.userId,
        startData: this.startDate,
        endDate: this.startDate,
        html: '<div class="title">Title</div>You can write here and add your own comments',
        stepId: null,
        personal: null,
        users: []
      };
      this.initSections();

      //TODO - build proper component and only fetch data when query parameters change
      //you can only select data from others which you have
      this.$http.get('/api/data/hearts/' + this.fitbitId + '/minmax')
        .then(response => {
          var minM = moment.unix(response.data[0].min);
          var maxM = moment.unix(response.data[0].max);
          this.minDate = minM.toISOString();
          this.maxDate = maxM.toISOString();
          this.startDate = moment(maxM).startOf('day');
          this.endDate = maxM;
          //TODO - use promises
          this.getData();
          this.getComments(true);
        });


    }

    initSections(){
      //init comments with default values
      var self = this;
      this.sections = Array.apply(null, Array(10)).map(function() { return self.defaultcomment });
    }

    hovered(d) {
      //this.barValue = d;
      //this.$scope.$apply();
      //console.log(d);
    }

    clicked(d) {
      console.log(d);
    }

    addData(right) {
      console.log(right.user);
      //add dates
      right.start = (moment(this.startDate, "DD/MM/YYYY").unix());
      right.end = (moment(this.endDate, "DD/MM/YYYY").unix());
      //console.log("clicked");
      this.$http.post("/api/data/hearts/", right).then(response => {
        this.graphData = response.data;
      });
    }


    //TODO - remove these datepicker stuff to separate file
    onRender() {
      //console.log('onRender');
    }

    onOpen(d) {
      //console.log('onOpen');
      this.currentCalValues[0] = this.startDate;
      this.currentCalValues[1] = this.endDate;
    }

    onClose() {
      //TODO - there is better way, server side maybe
      //avoid same queries
      if (this.currentCalValues[0] == this.startDate && this.currentCalValues[1] == this.endDate) return;
      //reset dataset
      this.graphData = null;
      //get new data
      this.getData();
      this.getComments(true);
    }

    onSet() {
      //console.log('onSet');
    }

    onStop() {
      //console.log('onStop');
    }

    getData() {
      this.$http.get('/api/data/hearts/' + this.fitbitId + '/' + (moment(this.startDate, "DD/MM/YYYY").unix()) + '/' + (moment(this.endDate, "DD/MM/YYYY").unix()))
        .then(response => {
          this.graphData = response.data;
        });
    }

    blur(e, personal) {
      //TODO - bind to ng-model
      var data = {};
      data.user = this.getCurrentUser()._id;
      data.stepId = e.target.id.substr(e.target.id.indexOf('-')+1);
      if(this.brushValue){
        data.startDate = this.brushValue[0];
        data.endDate = this.brushValue[1];
      } else {
        data.startDate = (moment(this.startDate, "DD/MM/YYYY")).toDate();
        data.endDate = (moment(this.endDate, "DD/MM/YYYY")).toDate();
      }

      data.html = e.target.innerText;
      data.personal = personal;
      if(!personal)
        data.users = this.users;
      //console.log(e);
      this.$http.post("/api/comments", data).then(response => {
        //console.log(response);
      });
    }

    getComments(personal) {
      var data = {};
      data.user = this.userId;
      data.startDate = (moment(this.startDate, "DD/MM/YYYY")).toDate();
      data.endDate = (moment(this.endDate, "DD/MM/YYYY")).toDate();
      data.personal = personal;
      var self = this;
      this.$http.post("/api/comments/list", data).then(response => {
        self.initSections();
        angular.forEach(response.data, function(value, key) {
          this[value.stepId-1] = value;
        }, this.sections);

      });
    }

    brushed(args){
      //console.log(args);
      this.brushValue = args;
    }
    active(step){
      console.log(step);
      console.log(this.rights[0]);
      if(step !=0)
      this.addData(this.rights[0]);
    }

  }

  angular.module('citizensemakersApp')
    .controller('DataController', DataController);

})();
