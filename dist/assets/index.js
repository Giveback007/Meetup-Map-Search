'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//@prepros-append babel/helpers.js
//@prepros-append babel/getEventData.js
//@prepros-append babel/map.js
//@prepros-append babel/controls.js
//@prepros-append babel/start.js

// -- helpers -- //
var help = {};

help.ajaxCall = function (url) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: url,
      type: 'get',
      dataType: "jsonp",
      success: function success(x) {
        // console.log('ajax', x); // temp
        resolve(x);
      },
      error: function error(err) {
        reject(err);
      }
    });
  });
};

help.limiter = function (meta) {
  var limit = Number(meta['X-RateLimit-Remaining']);
  var reset = Number(meta['X-RateLimit-Reset']);
  console.log('limit left ' + limit, ', reset ' + reset // temp
  );return new Promise(function (resolve, reject) {
    if (limit <= 1) {
      console.log('limit reached, ' + reset + ' seconds until reset'); // temp
      setTimeout(resolve, reset * 1000 + 500);
    } else {
      resolve();
    }
  });
};

help.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

help.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

help.getTimeObj = function (time) {
  var date = new Date(time);
  return {
    milis: time,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    min: date.getUTCMinutes(),
    weekDay: date.getUTCDay()
  };
};

help.getTimeString = function (time) {
  var hour = (time.hour + 11) % 12 + 1;
  var amPm = time.hour < 12 ? 'am' : 'pm';
  var min = time.min === 0 ? '00' : time.min;
  var full = help.daysOfWeek[time.weekDay] + ', ' + help.months[time.month] + (' ' + time.day + ', ' + hour + ':' + min + amPm);
  return full;
};

help.getMonthLimit = function (monthsFromNow) {
  var date = new Date();
  var m = date.getUTCMonth();
  var y = date.getUTCFullYear();

  var lastDay = new Date(y, m + monthsFromNow + 1, 0);
  var end = lastDay.setHours(23, 59, 59, 999);

  return end;
};

help.createCalendarObj = function (limit) {
  var calendar = {};
  var months = [];
  var oneDay = 24 * 60 * 60 * 1000;
  var today = new Date().setUTCHours(23, 59, 59, 999);

  var lastDay = new Date(limit).setUTCHours(23, 59, 59, 999);
  var numDays = (lastDay - today) / oneDay;

  var now = help.getTimeObj(new Date() - new Date().getTimezoneOffset() * 60000);
  for (var i = 0; i < numDays; i++) {
    var refDay = new Date(now.year, now.month, now.day + i);
    var m = refDay.getFullYear() + '-' + help.months[refDay.getMonth()];
    var d = '' + refDay.getDate();
    if (!calendar[m]) {
      calendar[m] = {};months.push(m);
    }
    calendar[m][d] = [];
  }
  return { calendar: calendar, months: months };
};

help.cloneObj = function (obj) {
  var clone = JSON.stringify(obj);
  return JSON.parse(clone);
};
// -- helpers -- //

// -- geoLocate -- //
var geoLocate = function geoLocate() {
  return new Promise(function (resolve, reject) {
    resolve([41.957819, -87.994403]); // temp
    var options = {
      enableHighAccuracy: true,
      maximumAge: Infinity
    };
    var success = function success(pos) {
      var crd = pos.coords;
      resolve([crd.latitude, crd.longitude]);
    };
    var error = function error(err) {
      console.log(err, 'put in custom location');
      resolve([41.957819, -87.994403]);
    };
    // navigator.geolocation.getCurrentPosition(success, error, options);
  });
};
// -- geoLocate -- //

// -- findEvents -- //
var findEvents = function findEvents(url, allEvents) {
  return new Promise(function (resolve, reject) {
    var parseData = function parseData(dt) {
      var events = help.cloneObj(allEvents);
      // Make the data more usable
      var data = dt.data.map(function (x) {
        var obj = x;
        obj.loc = obj.venue ? [obj.venue.lat, obj.venue.lon] : null;
        obj.time = help.getTimeObj(obj.time + obj.utc_offset);
        obj.duration = obj.duration / 60000 || null;
        delete obj.utc_offset;
        delete obj.venue;
        return obj;
      });

      // Put the data in calendar form
      data.map(function (x) {
        var m = x.time.year + '-' + help.months[x.time.month];
        var d = '' + x.time.day;
        if (!events[m]) {
          return;
        }
        events[m][d].push(x);
      });

      var obj = {};
      obj.events = events;
      obj.meta = dt.meta;

      resolve(obj);
    };

    help.ajaxCall(url).then(function (x) {
      return resolve(parseData(x));
    });
  });
};
// -- findEvents -- //

// This React class encapsulates the leaflet map

var Map = function (_React$Component) {
  _inherits(Map, _React$Component);

  function Map(props) {
    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));

    _this.markerCluster = L.markerClusterGroup();

    _this.initMap = function () {
      _this.mainMap = L.map('map').setView([38.366473, -96.262056], 5);
      var openstreetmaps = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org/">' + 'OpenStreetMap</a> contributors'
      });
      _this.mainMap.addLayer(openstreetmaps);
    };

    _this.clearMap = function () {};

    _this.center = function (loc, rds) {
      _this.mainMap.flyTo(loc, 10, { duration: 3 });

      var centerIcon = L.divIcon({
        className: 'centerMarker',
        iconSize: new L.Point(100, 100),
        html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
      });
      _this.centerMarker = L.marker(loc, { icon: centerIcon }).bindTooltip('Search Center', {
        offset: [0, 0],
        direction: 'top'
      });
      //.bindPopup("<b>Search Center</b>"); ///////////
      _this.mainMap.addLayer(_this.centerMarker);

      _this.centerRadius = L.circle(loc, {
        radius: 1609.344 * rds,
        interactive: false,
        fillOpacity: 0.07,
        opacity: 0.4
      });
      _this.mainMap.addLayer(_this.centerRadius);
    };

    _this.putEventsOnMap = function (events) {
      events.map(function (x) {
        var loc = x.loc ? x.loc : [x.group.lat, x.group.lon];
        if (!loc[0] && !loc[1]) {
          loc = [x.group.lat, x.group.lon];
        } // x.loc || (!x.loc[0] && !x.loc[1])
        var img = x.group.photo ? x.group.photo.thumb_link : 'assets/imgs/meetup_logo.png';

        var icon = L.divIcon({
          className: 'marker',
          iconSize: new L.Point(50, 50),
          html: '<div class=\'marker-img\' style=\'background-image: url(' + img + ')\'></div>'
        });

        var marker = new L.marker(loc, { icon: icon }).bindPopup('<b>' + x.group.name + '</b>\n          <br/>' + x.name + '\n          <br/><i class="fa fa-clock-o" aria-hidden="true"></i>\n            ' + help.getTimeString(x.time) + '\n          <br/><a href=\'' + x.link + '\' target=\'_blank\'>More Info</a>', { offset: [0, -5] }).bindTooltip('' + x.group.name, {
          offset: [0, -20],
          direction: 'top'
        });

        _this.markerCluster.addLayer(marker);
      });
      _this.mainMap.addLayer(_this.markerCluster);
    };

    return _this;
  }
  // -- initMap -- //

  // -- initMap -- //

  // -- clearMap -- //

  // -- clearMap -- //

  // -- newSearch -- //

  // -- newSearch -- //

  // -- putEventsOnMap -- //


  _createClass(Map, [{
    key: 'componentDidMount',

    // -- putEventsOnMap -- //

    value: function componentDidMount() {
      this.initMap();
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.props.isReady) {
        this.center(this.props.center, this.props.radius);
        this.putEventsOnMap(this.props.events);
      }
      return null;
    }
  }]);

  return Map;
}(React.Component);
/////////////////////


// -- renderEventsOnMap -- //
// function renderEventsOnMap(events)
// {
//   // -- Create Markers From Events Data -- //
//   let markerCluster = L.markerClusterGroup();
//   events.map(x =>
//   {
//     let loc = x.loc ? x.loc : [x.group.lat, x.group.lon];
//     if (!loc[0] && !loc[1]) {loc = [x.group.lat, x.group.lon]}
//     let img = x.group.photo ?
//       x.group.photo.thumb_link : 'assets/imgs/meetup_logo.png';
//
//     let icon = L.divIcon(
//     {
//       className: 'marker',
//       iconSize: new L.Point(50, 50),
//       html: `<div class='marker-img' style='background-image: url(${img})'></div>`
//     });
//
//     let marker = new L.marker(
//       loc,
//       {icon: icon}
//     )
//       .bindPopup(
//         `<b>${x.group.name}</b>
//         <br/>${x.name}
//         <br/><i class="fa fa-clock-o" aria-hidden="true"></i>
//           ${getFullTime(x.time)}
//         <br/><a href='${x.link}' target='_blank'>More Info</a>`,
//         {offset: [0, -5]}
//       )
//       .bindTooltip(
//         `${x.group.name}`,
//         {
//         offset: [0, -20],
//         direction: 'top'
//         }
//       );
//
//     markerCluster.addLayer(marker);
//   });
//   this.mainMap.addLayer(markerCluster);
// }
// -- renderEventsOnMap -- //

var Controls = function (_React$Component2) {
  _inherits(Controls, _React$Component2);

  function Controls(props) {
    _classCallCheck(this, Controls);

    var _this2 = _possibleConstructorReturn(this, (Controls.__proto__ || Object.getPrototypeOf(Controls)).call(this, props));

    _this2.filterEvents = function () {
      var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this2.state.filter;

      var events = _this2.state.events[opt.day[0]][opt.day[1] + 1]; // -- temp TODO +1 remove
      var filtered = void 0;
      if (!opt.categories[0]) {
        filtered = events;
      } else {
        // TODO filter events by id#
      }
      _this2.setState({ onMapEvents: filtered });
    };

    _this2.state = {
      isReady: false,
      radius: 100, // max 100.00
      searchLoc: [38.366473, -96.262056],
      api: {
        key: '457b71183481b13752d69755d97632',
        omit: 'description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url',
        getUrl: function getUrl() {
          var loc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this2.state.searchLoc;
          return 'https://api.meetup.com/find/events?' + '&sign=true&photo-host=public&' + ('lat=' + loc[0] + '&lon=' + loc[1]) + ('&radius=' + _this2.state.radius + '&fields=group_photo,group_category') + ('&omit=' + _this2.state.api.omit + '&key=' + _this2.state.api.key);
        }
      },
      events: {},
      months: [],
      today: {},
      filter: { day: [], categories: [] },
      onMapEvents: [],
      meta: {}
    };

    return _this2;
  }

  _createClass(Controls, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this3 = this;

      var calendarObj = help.createCalendarObj(help.getMonthLimit(3));
      var today = help.getTimeObj(new Date() - new Date().getTimezoneOffset() * 60000);
      this.setState({
        events: calendarObj.calendar,
        months: calendarObj.months,
        today: today,
        filter: { day: [calendarObj.months[0], today.day], categories: [] }
      });

      geoLocate().then(function (x) {
        _this3.setState({ searchLoc: x, isReady: true });
        return findEvents(_this3.state.api.getUrl(x), _this3.state.events); // TODO create a native function
      }).then(function (x) {
        _this3.setState({ events: x.events, meta: x.meta });
        _this3.filterEvents();
      });
    }
  }, {
    key: 'render',
    value: function render() {
      console.log('render -> this.state.onMapEvents', this.state.onMapEvents);
      return React.createElement(
        'div',
        null,
        React.createElement(Map, {
          isReady: this.state.isReady,
          events: this.state.onMapEvents,
          center: this.state.searchLoc,
          radius: this.state.radius
        })
      );
    }
  }]);

  return Controls;
}(React.Component);

(function () {
  ReactDOM.render(React.createElement(Controls, null), document.getElementById('nav'));
  // render controls
  // find events
  // render map
})();