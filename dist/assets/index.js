'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//@prepros-append babel/helper_and_params.js
//@prepros-append babel/time.js
//@prepros-append babel/async.js
//@prepros-append babel/map.js
//@prepros-append babel/controls.js
//@prepros-append babel/start.js

// const params =
// {
// 	totalMonths: 1 // no including this month
// }

var help = {};

help.clone = function (obj) {
  var clone = JSON.stringify(obj);
  return JSON.parse(clone);
};

var time = {};

time.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

time.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

time.getTimeObj = function (unix, offset) {
  var getTimeString = function getTimeString(t) {
    var hour = (t.hour + 11) % 12 + 1;
    var amPm = t.hour < 12 ? 'am' : 'pm';
    var min = t.min === 0 ? '00' : t.min;
    var full = time.daysOfWeek[t.weekDay] + ', ' + time.months[t.month] + (' ' + t.day + ', ' + hour + ':' + min + ' ' + amPm);
    return full;
  };

  var date = new Date(unix - offset);

  var obj = {
    unix: unix,
    offset: offset,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    min: date.getUTCMinutes(),
    weekDay: date.getUTCDay()
  };
  obj.timeString = getTimeString(obj);
  obj.key = [obj.year + '-' + time.months[obj.month], '' + obj.day];

  return obj;
};

time.getMonthLimit = function (monthsFromNow) {
  var date = new Date();
  var m = date.getUTCMonth();
  var y = date.getUTCFullYear();

  var lastDay = new Date(y, m + monthsFromNow + 1, 0);
  var end = lastDay.setHours(23, 59, 59, 999);

  return end;
};

time.createCalendarObj = function (limit) {
  var tracker = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var calendar = {};
  var months = [];
  var oneDay = 24 * 60 * 60 * 1000;
  var today = new Date().setUTCHours(23, 59, 59, 999);

  var lastDay = new Date(limit).setUTCHours(23, 59, 59, 999);
  var numDays = (lastDay - today) / oneDay;

  var now = time.getTimeObj(new Date(), new Date().getTimezoneOffset() * 60000);
  for (var i = 0; i < numDays; i++) {
    var refDay = new Date(now.year, now.month, now.day + i);
    var m = refDay.getFullYear() + '-' + time.months[refDay.getMonth()];
    var d = '' + refDay.getDate();
    if (!calendar[m]) {
      calendar[m] = {};months.push(m);
    }

    tracker ? calendar[m][d] = false : calendar[m][d] = [];
  }
  return { calendar: calendar, months: months };
};

var async = {};
// -- ajaxCall -- //
async.ajaxCall = function (url) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: url,
      type: 'get',
      dataType: "jsonp",
      success: function success(x) {
        console.log('ajax', x); // temp
        resolve(x);
      },
      error: function error(err) {
        reject(err);
      }
    });
  });
};
// -- ajaxCall -- //

// -- limiter -- //
async.limiter = function (meta) {
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
// -- limiter -- //

// -- geoLocate -- //
async.geoLocate = function () {
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
async.findEvents = function (url, allEvents) {
  return new Promise(function (resolve, reject) {
    var parseData = function parseData(dt) {
      var events = help.clone(allEvents);
      // Forms the data
      var data = dt.data.map(function (x) {
        var obj = x;
        obj.loc = obj.venue ? [obj.venue.lat, obj.venue.lon] : null;
        obj.time = time.getTimeObj(obj.time, obj.utc_offset * -1);
        obj.duration = obj.duration / 60000 || null;
        delete obj.utc_offset;
        delete obj.venue;
        return obj;
      });

      // Merges the data into existing calendar form
      data.map(function (x) {
        var key = x.time.key;
        if (!events[key[0]]) {
          return;
        }
        events[key[0]][key[1]].push(x);
      });

      var obj = {};
      obj.events = events;
      obj.meta = dt.meta;
      obj.lastEventTime = data[data.length - 1].time;

      return obj; // <-
    };

    async.ajaxCall(url).then(function (x) {
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

        var marker = new L.marker(loc, { icon: icon }).bindPopup('<b>' + x.group.name + '</b>\n          <br/>' + x.name + '\n          <br/><i class="fa fa-clock-o" aria-hidden="true"></i>\n            ' + time.timeString + '\n          <br/><a href=\'' + x.link + '\' target=\'_blank\'>More Info</a>', { offset: [0, -5] }).bindTooltip('' + x.group.name, {
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
        console.log('render -> map');
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

      var events = _this2.state.events[opt.day[0]][opt.day[1]];
      var filtered = void 0;
      if (!opt.categories[0]) {
        filtered = events;
      } else {
        // TODO filter events by id#
      }
      _this2.setState({ onMapEvents: filtered, isReady: false });
    };

    _this2.findEventsLoop = function (data, limit) {
      var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _this2.state.meta;

      var count = 0; // temp
      var loop = function loop(obj) {
        count++; // temp
        _this2.filterEvents(); // TODO triger after firstDay is loaded
        _this2.setState({ events: obj.events, meta: obj.meta });
        if (obj.meta.next_link && obj.lastEventTime.unix < limit.unix) {
          async.limiter(obj.meta).then(function () {
            console.log('loop-' + count);
            return async.findEvents(obj.meta.next_link + '&key=&{this.state.api.key}', _this2.state.events);
          }).then(function (x) {
            loop(x);
          });
        } else {
          _this2.setState({ loadDone: true, isReady: true });
          console.log('loop-done, set all days to loaded'); // TODO
          console.log(_this2.state.events); // TODO temp
          return;
        }
      };
      // triger the loop
      async.findEvents(_this2.state.api.getUrl(data), _this2.state.events).then(function (x) {
        loop(x);
        console.log('isReady: true');
        _this2.setState({ isReady: true }); // TODO temp only triger when firsDay done
      });
    };

    _this2.shouldRender = function () {
      // TODO create more conditionals
      return _this2.state.isReady ? true : false;
    };

    _this2.componentDidMount = function () {
      var end = time.getMonthLimit(_this2.state.loadMonths);
      var calendarObj = time.createCalendarObj(end);
      var tracker = time.createCalendarObj(end, true);
      var today = time.getTimeObj(new Date(), new Date().getTimezoneOffset() * 60000);
      var lastDay = new Date(end);
      lastDay = time.getTimeObj(lastDay, lastDay.getTimezoneOffset() * 60000);
      _this2.setState({
        events: calendarObj.calendar,
        dayIsLoaded: tracker.calendar,
        months: calendarObj.months,
        today: today,
        lastDay: lastDay,
        filter: { day: [calendarObj.months[0], today.day], categories: [] }
      });

      async.geoLocate().then(function (x) {
        _this2.setState({ searchLoc: x, isReady: true });
        return _this2.findEventsLoop(x, _this2.state.lastDay);
      });
    };

    _this2.state = {
      isReady: false, // signal to Map if ready to render
      loadDone: false,
      radius: 10, // max 100.00 (miles)
      searchLoc: [38.366473, -96.262056],
      loadMonths: 0, // 0 loads this month only
      api: {
        key: '457b71183481b13752d69755d97632',
        omit: 'description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url',
        getUrl: function getUrl() {
          var loc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this2.state.searchLoc;
          return 'https://api.meetup.com/find/events?' + '&sign=true&photo-host=public&' + ('lat=' + loc[0] + '&lon=' + loc[1]) + ('&radius=' + _this2.state.radius + '&fields=group_photo,group_category') + ('&omit=' + _this2.state.api.omit + '&key=' + _this2.state.api.key);
        }
      },
      events: {},
      dayIsLoaded: {},
      months: [],
      today: {},
      lastDay: {},
      filter: { day: [], categories: [] },
      onMapEvents: [],
      meta: {}
    };

    return _this2;
  }

  _createClass(Controls, [{
    key: 'render',
    value: function render() {
      // console.log('render -> this.state.onMapEvents', this.state.onMapEvents);
      if (this.shouldRender()) {
        this.filterEvents();
        // this.setState({isReady: false})
      }
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