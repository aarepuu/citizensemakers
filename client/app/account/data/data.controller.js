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
      this.users = ["5785fa1b4269303f1b89596d"];
      this.personalSections = [];
      this.sections = [];

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
        user: this.userId,
        startDate: this.startDate,
        endDate: this.startDate,
        text: '',
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
          this.getPersonalComments();
          this.getComments();
        });


    }

    initSections(){
      //init comments with default values
      var self = this;
      this.personalSections = Array.apply(null, Array(10)).map(function() { return JSON.parse(JSON.stringify(self.defaultcomment)) });
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
      this.populateUsers(right.userId);
      //add dates
      right.start = (moment(this.startDate, "DD/MM/YYYY").unix());
      right.end = (moment(this.endDate, "DD/MM/YYYY").unix());
      //console.log("clicked");
      this.$http.post("/api/data/hearts", right).then(response => {
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
      this.getComments(false);
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

    blur(e,section,personal) {
      //TODO - bind to ng-model
      console.log(section);
      //return;
      if(!section.stepId){
        section.stepId = e.target.id.substr(e.target.id.indexOf('-')+1);
        if(this.brushValue){
          section.startDate = this.brushValue[0];
          section.endDate = this.brushValue[1];
        } else {
          section.startDate = (moment(this.startDate, "DD/MM/YYYY")).toDate();
          section.endDate = (moment(this.endDate, "DD/MM/YYYY")).toDate();
        }
        section.personal = personal;
        if(!personal)
          section.users = this.users;
      }
      this.$http.post("/api/comments", section).then(response => {
        section = response.data;
      });
    }

    getPersonalComments() {
      var data = {};
      data.user = this.userId;
      data.startDate = (moment(this.startDate, "DD/MM/YYYY")).toDate();
      data.endDate = (moment(this.endDate, "DD/MM/YYYY")).toDate();
      data.personal = true;
      var self = this;
      this.$http.post("/api/comments/list", data).then(response => {
        self.initSections();
        angular.forEach(response.data, function(value, key) {
          this[value.stepId-1] = value;
        }, this.personalSections);
      });
    }

    getComments() {
      var data = {};
      data.user = this.userId;
      data.startDate = (moment(this.startDate, "DD/MM/YYYY")).toDate();
      data.endDate = (moment(this.endDate, "DD/MM/YYYY")).toDate();
      data.personal = false;
      data.users = this.users;
      var self = this;
      this.$http.post("/api/comments/list", data).then(response => {
        //self.initSections();
        //var userinfo = this.$filter('filter')(this.rights, {userId: userId})[0];
        this.sections = Array.apply(null, Array(10)).map(function() { return [] });
        angular.forEach(response.data, function(value, key) {
          this[value.stepId-1].push(value);
        }, this.sections);
        //this.sections = response.data;
      });
    }

    brushed(args){
      //console.log(args);
      this.brushValue = args;
    }
    active(step){
      //console.log(step);
      //console.log(this.rights[0]);
      if(step !=0)
      this.addData(this.rights[0]);
    }

    populateUsers(userId){
      var index = this.users.indexOf(userId);
      if (index == -1) {
        this.users.push(userId);
      }
      else {
        this.users.splice(index, 1);
      }
    }

  }

  angular.module('citizensemakersApp')
    .controller('DataController', DataController);

})();
