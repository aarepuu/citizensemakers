'use strict';

(function () {

  class DataController {


    constructor($http, $scope, $filter, Auth) {
      this.Auth = Auth;
      this.$scope = $scope;
      this.$http = $http;
      this.$filter = $filter;
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
      this.graphData = [];
      this.interpolate = 'monotone';
      this.currentCalValue = null;
      this.brushValue = null;
      this.users = [];
      this.userList = null;
      this.personalSections = [];
      this.sections = [];
      this.currentComment = '';
      this.currentPersonalComment = '';
      this.ready = 0;
      this.extent = 0;

      this.getCurrentUser = this.Auth.getCurrentUser();
      var self = this;
      //to get rid of racing conditions
      this.$scope.$watch("vm.getCurrentUser.rights", function (val) {
        if (typeof val != 'undefined') {
          self.fitbitId = self.getCurrentUser.fitbitId;
          self.userId = self.getCurrentUser._id;
          //push currentuser to users array
          self.users.push(self.userId);
          //TODO - change the names of right arrays. make it more explicit
          self.rights = self.getCurrentUser.rights.you;
          //default comment
          self.defaultcomment = {
            user: self.userId,
            startDate: self.startDate,
            endDate: self.endDate,
            text: '',
            stepId: null,
            personal: null,
            users: []
          };

          self.init();
        }
      });
    }


    init() {
      this.$http.get('/api/users/all').then(response => {
        this.userList = response.data;
      });
      //TODO - build proper component and only fetch data when query parameters change
      var minM = moment(this.getCurrentUser.lastSync).subtract(1, "week").startOf('day');
      var maxM = moment(this.getCurrentUser.lastSync);
      this.minDate = minM.toISOString();
      this.maxDate = maxM.toISOString();
      this.startDate = maxM;
      this.endDate = maxM;
      //TODO - use promises
      this.getData();
      this.getPersonalComments();
      this.getComments();

    }

    initSections() {
      //init comments with default values
      var self = this;
      this.personalSections = Array.apply(null, Array(6)).map(function () {
        return JSON.parse(JSON.stringify(self.defaultcomment))
      });
    }

    hovered(d) {
      //this.barValue = d;
      //this.$scope.$apply();
      //console.log(d);
    }

    goToComment(extent) {
      this.extent = extent;
    }

    getAvatar(userId) {
      if (!this.userList) return '../../assets/images/user.png';
      if (userId == this.userId) {
        return (this.getCurrentUser.avatar.length > 0) ? this.getCurrentUser.avatar : '../../assets/images/user.png';
      }
      var avatar = this.$filter('filter')(this.userList, {_id: userId});
      return (typeof(avatar[0]) != 'undefined' && avatar[0] != null) ? (avatar[0].avatar.length > 0) ? avatar[0].avatar : '../../assets/images/user.png' : '../../assets/images/user.png';
    }

    addData(e, right) {
      var target = $(e.target).find('img');
      var user = this.populateUsers(right.userId);
      this.getComments();
      if (user) {
        target.css({"border": "3px solid rgb(31, 119, 180)"});
        target.addClass('friend-selected');
        //add dates
        right.start = (moment(this.startDate, "MM/DD/YYYY").unix());
        right.end = (moment(this.startDate, "MM/DD/YYYY").endOf('day').unix());
        //TODO - make this into a function
        this.$http.post("/api/data/hearts", right).then(response => {
          if (response.data.length > 0)
            this.graphData[0] = response;
        });
        this.$http.post("/api/data/sleeps", right).then(response => {
          if (response.data.length > 0)
            this.graphData[1] = response;
        });
        this.$http.post("/api/data/steps", right).then(response => {
          if (response.data.length > 0)
            this.graphData[2] = response;
        });
      } else {
        target.css({"border": "none"});
        target.removeClass('friend-selected');
        //TODO - hacky way of cleaning data, change
        var response = {};
        response.data = [{user: right.fitbitId, remove: true}];
        this.graphData[0] = response;
        this.graphData[1] = response;
        this.graphData[2] = response;
      }
    }


    //TODO - remove these datepicker stuff to separate file
    onRender() {
      //console.log('onRender');
    }

    onOpen(d) {
      //console.log('onOpen');
      this.currentCalValue = this.startDate;
    }

    onClose(e) {
      //TODO - there is better way, server side maybe
      //avoid same queries
      if (this.currentCalValue == this.startDate) return;
      //reset dataset
      this.graphData = [];
      this.users = [];
      this.users.push(this.userId);

      //get new data
      this.getData();
      this.getComments();
      this.getPersonalComments();
    }

    onSet() {
      //console.log('onSet');
    }

    onStop() {
      //console.log('onStop');
    }

    getData() {
      this.$http.get('/api/data/hearts/' + this.fitbitId + '/' + (moment(this.startDate, "MM/DD/YYYY").unix()) + '/' + (moment(this.startDate, "MM/DD/YYYY").endOf('day').unix()))
        .then(response => {
          if (response.data.length > 0)
            this.graphData[0] = response;
        });
      //console.log(moment(this.startDate, "MM/DD/YYYY").toDate()+' '+moment(this.startDate, "MM/DD/YYYY").endOf('day').toDate());
      this.$http.get('/api/data/sleeps/' + this.fitbitId + '/' + (moment(this.startDate, "MM/DD/YYYY").unix()) + '/' + (moment(this.startDate, "MM/DD/YYYY").endOf('day').unix()))
        .then(response => {
          if (response.data.length > 0)
            this.graphData[1] = response;
        });
      this.$http.get('/api/data/steps/' + this.fitbitId + '/' + (moment(this.startDate, "MM/DD/YYYY").unix()) + '/' + (moment(this.startDate, "MM/DD/YYYY").endOf('day').unix()))
        .then(response => {
          if (response.data.length > 0)
            this.graphData[2] = response;
        });
    }

    personalComment(e, values) {
      //TODO - bind to ng-model
      if (!this.currentPersonalComment) return;
      var section = {};
      section.createdAt = moment();
      section.text = this.currentPersonalComment;
      section.user = this.userId;
      section.name = this.getCurrentUser.name;
      this.currentPersonalComment = '';
      section.stepId = e.target.id.substr(e.target.id.indexOf('-') + 1);
      if (this.brushValue) {
        section.startDate = this.brushValue[0];
        section.endDate = this.brushValue[1];
      } else {
        section.startDate = (moment(this.startDate, "MM/DD/YYYY"));
        section.endDate = (moment(this.startDate, "MM/DD/YYYY")).endOf('day');
      }
      section.personal = true;
      values.unshift(section);

      this.$http.post("/api/comments", section).then(response => {
        section = response.data;
      });
    }

    comment(e, values) {
      if (!this.currentComment || this.users.length == 1) return;
      var section = {};
      section.createdAt = moment();
      section.text = this.currentComment;
      section.user = this.userId;
      section.name = this.getCurrentUser.name;
      this.currentComment = '';
      section.stepId = e.target.id.substr(e.target.id.indexOf('-') + 1);
      if (this.brushValue) {
        section.startDate = this.brushValue[0];
        section.endDate = this.brushValue[1];
      } else {
        section.startDate = (moment(this.startDate, "MM/DD/YYYY")).toDate();
        section.endDate = (moment(this.startDate, "MM/DD/YYYY")).endOf('day').toDate();
      }
      section.personal = false;
      section.users = this.users;


      values.unshift(section);

      this.$http.post("/api/comments", section).then(response => {
        section = response.data;
      });
    }

    getPersonalComments() {
      var data = {};
      data.user = this.userId;
      data.startDate = (moment(this.startDate, "MM/DD/YYYY")).toDate();
      data.endDate = (moment(this.startDate, "MM/DD/YYYY")).endOf('day').toDate();
      data.personal = true;
      var self = this;
      this.$http.post("/api/comments/list", data).then(response => {
        //self.initSections();
        this.personalSections = Array.apply(null, Array(6)).map(function () {
          return []
        });
        angular.forEach(response.data, function (value, key) {
          this[value.stepId - 1].push(value);
        }, this.personalSections);
        this.ready++;
      });
    }

    getComments() {
      //TODO - update brushValue to get previous day
      var data = {};
      data.user = this.userId;
      //TODO - with sleep it doesn't work because of the day overlap
      data.startDate = (moment(this.startDate, "MM/DD/YYYY")).toDate();
      data.endDate = (moment(this.startDate, "MM/DD/YYYY")).endOf('day').toDate();
      data.personal = false;
      data.users = this.users;
      var self = this;
      this.$http.post("/api/comments/list", data).then(response => {
        //self.initSections();
        //var userinfo = this.$filter('filter')(this.rights, {userId: userId})[0];
        this.sections = Array.apply(null, Array(6)).map(function () {
          return []
        });
        angular.forEach(response.data, function (value, key) {
          this[value.stepId - 1].push(value);
        }, this.sections);
        this.ready++;
      });
    }

    brushed(args) {
      //console.log(args);
      this.brushValue = args;
    }

    active(step) {
      if (step != 0)
        this.addData(this.rights[0]);
    }

    populateUsers(userId) {
      var index = this.users.indexOf(userId);
      if (index == -1) {
        this.users.push(userId);
        this.users.sort();
        return userId;
      }
      else {
        this.users.splice(index, 1);
        this.users.sort();
        return false;
      }
    }

  }

  angular.module('citizensemakersApp')
    .controller('DataController', DataController);

})();
