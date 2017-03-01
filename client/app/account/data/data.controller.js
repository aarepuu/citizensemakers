'use strict';

(function () {

  class DataController {


    constructor($http, $scope, $filter, Auth, $rootScope, $location, $anchorScroll) {
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
      this.others = false;
      this.usedColors = [];
      this.origcolors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
      this.colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
      this.sectionNames = ["Sleep", "Morning activities", "Morning Heart Rate", "Lunchtime Activities","Afternoon Heart Rate", "Evening Activities"];
      this.notifications = [];
      this.getCurrentUser = this.Auth.getCurrentUser();
      var self = this;



      //route
      /*$rootScope.$on('$routeChangeSuccess', function (newRoute, oldRoute) {
        if ($location.hash()) {
          $anchorScroll.yOffset = -200;
          $anchorScroll();
        }
      });*/



      this.$http.get('/api/comments/discuss').then(response => {
        response.data.forEach(function(d){
          d.datestep = moment(d.startDate).format('YYYYMMDD'+ d.stepId + d.users.toString());
        });
        //console.log(response.data);
        this.notifications = response.data;
      });
      //to get rid of racing conditions
      this.$scope.$watch("vm.getCurrentUser.rights", function (val) {
        if (typeof val != 'undefined') {
          self.fitbitId = self.getCurrentUser.fitbitId;
          self.userId = self.getCurrentUser._id;
          //push currentuser to users array
          self.users.push(self.userId);
          self.usedColors[self.userId] = self.colors.shift();
          //TODO - change the names of right arrays. make it more explicit
          self.rights = self.getCurrentUser.rights.you
          //default comment
          self.defaultcomment = {
            user: self.userId,
            startDate: self.startDate,
            endDate: self.endDate,
            text: '',
            stepId: null,
            personal: null,
            createdAt: null,
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


      this.$http.get('/api/data/steps/' + this.fitbitId + '/minmax')
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

      //TODO - build proper component and only fetch data when query parameters change
      /*var minM = moment(this.getCurrentUser.lastSync).subtract(1, "week").startOf('day');
       var maxM = moment(this.getCurrentUser.lastSync);
       this.minDate = minM.toISOString();
       this.maxDate = maxM.toISOString();
       this.startDate = maxM;
       this.endDate = maxM;
       //TODO - use promises
       this.getData();
       this.getPersonalComments();
       this.getComments();*/

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
      //var target = $(e.target).find('img');
      //console.log(e);
      var target = $(e.target);
      var user = this.populateUsers(right.userId);
      //console.log(this.getUserColor(right.userId));

      this.getComments();
      if (user) {
        target.css({"border": "3px solid " + this.getUserColor(right.userId)});
        target.addClass('friend-selected');
        //add dates
        right.start = (moment(this.startDate, "MM/DD/YYYY").unix());
        right.end = (moment(this.startDate, "MM/DD/YYYY").endOf('day').unix());
        //TODO - make this into a function
        this.$http.post("/api/data/hearts", right).then(response => {
          response.color = this.getUserColor(right.userId);
          if (response.data.length > 0)
            this.graphData[0] = response;
        });
        this.$http.post("/api/data/sleeps", right).then(response => {
          response.color = this.getUserColor(right.userId);
          if (response.data.length > 0)
            this.graphData[1] = response;
        });
        this.$http.post("/api/data/steps", right).then(response => {
          response.color = this.getUserColor(right.userId);
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

    onClose() {
      //TODO - there is better way, server side maybe
      //avoid same queries
      if (this.currentCalValue == this.startDate) return;
      //reset dataset
      this.graphData = [];
      this.users = [];
      this.usedColors = [];
      this.colors = JSON.parse(JSON.stringify(this.origcolors));
      this.users.push(this.userId);
      this.usedColors[this.userId] = this.colors.shift();
      $('.friends-list--friend-img').css({"border": "none"});

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
          response.color = this.getUserColor(this.userId);
          if (response.data.length > 0)
            this.graphData[0] = response;
        });
      //console.log(moment(this.startDate, "MM/DD/YYYY").toDate()+' '+moment(this.startDate, "MM/DD/YYYY").endOf('day').toDate());
      this.$http.get('/api/data/sleeps/' + this.fitbitId + '/' + (moment(this.startDate, "MM/DD/YYYY").unix()) + '/' + (moment(this.startDate, "MM/DD/YYYY").endOf('day').unix()))
        .then(response => {
          response.color = this.getUserColor(this.userId);
          if (response.data.length > 0)
            this.graphData[1] = response;
        });
      this.$http.get('/api/data/steps/' + this.fitbitId + '/' + (moment(this.startDate, "MM/DD/YYYY").unix()) + '/' + (moment(this.startDate, "MM/DD/YYYY").endOf('day').unix()))
        .then(response => {
          response.color = this.getUserColor(this.userId);
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
      section.users = this.users.sort();


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

    populateUsers(userId, notification) {
      var index = this.users.indexOf(userId);
      if (index == -1) {
        this.users.push(userId);
        this.usedColors[userId] = this.colors.shift();
        this.others = true;
        return userId;
      }
      else {
        //don't ever move yourself form users
        if (this.userId == userId || notification)
          return false;
        this.users.splice(index, 1);
        this.colors.push(this.usedColors[userId]);
        delete this.usedColors[userId];
        if (this.users.length <= 1)
          this.others = false;
        return false;
      }
    }

    getUserColor(userId) {
      return this.usedColors[userId];
    }

    goToDiscussion(talk) {
      //if (this.currentCalValue == this.startDate) return;
      //reset dataset
      this.graphData = [];
      this.users = [];
      this.usedColors = [];
      this.colors = JSON.parse(JSON.stringify(this.origcolors));
      this.users.push(this.userId);
      this.usedColors[this.userId] = this.colors.shift();
      $('.friends-list--friend-img').css({"border": "none"});

      //get new data

      this.startDate = moment(talk.startDate).format("MM/DD/YYYY");
      this.endDate = moment(talk.endDate).format("MM/DD/YYYY");
      this.getData();
      var self = this;

      talk.users.forEach(function (userId) {
        //var target = $(e.target).find('img');
        if (userId == self.userId) return;
        var target = $("#user-" + userId);
        self.populateUsers(userId, true);
        //console.log(this.getUserColor(right.userId));
        target.css({"border": "3px solid " + self.getUserColor(userId)});
        target.addClass('friend-selected');
        var right = self.$filter('filter')(self.rights, {userId: userId})[0];
        right.start = (moment(self.startDate, "MM/DD/YYYY").unix());
        right.end = (moment(self.startDate, "MM/DD/YYYY").endOf('day').unix());
        //TODO - make this into a function
        self.$http.post("/api/data/hearts", right).then(response => {
          response.color = self.getUserColor(right.userId);
          if (response.data.length > 0)
            self.graphData[0] = response;
        });
        self.$http.post("/api/data/sleeps", right).then(response => {
          response.color = self.getUserColor(right.userId);
          if (response.data.length > 0)
            self.graphData[1] = response;
        });
        self.$http.post("/api/data/steps", right).then(response => {
          response.color = self.getUserColor(right.userId);
          if (response.data.length > 0)
            self.graphData[2] = response;
        });

      });


      this.getComments();
      this.getPersonalComments();


      $('html,body').unbind().animate({scrollTop: $('#comments-'+talk.stepId).offset().top - ( $(window).height() - $('#comments-'+talk.stepId).outerHeight(true) ) / 2},'slow');

    }

  }

  angular.module('citizensemakersApp')
    .controller('DataController', DataController);

})();
