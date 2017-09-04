'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//@prepros-append babel/helper.js
//@prepros-append babel/time.js
//@prepros-append babel/async.js
//@prepros-append babel/map.js
//@prepros-append babel/controls.js
//@prepros-append babel/start.js

var task = {};

task.clone = function (obj) {
  var clone = JSON.stringify(obj);
  return JSON.parse(clone);
};

task.updateDateTracker = function (tracker, limit) {
  var loaded = task.clone(tracker);

  var y = limit.year,
      m = limit.month,
      d = limit.day;
  var stop = false;
  while (!stop) {
    d--;
    if (d < 1) {
      m--;d = 31;
    }
    if (m < 0) {
      y--;m = 11;
    }
    var key = time.getKey(y, m, d);
    if (tracker[key[0]] !== undefined) {
      if (loaded[key[0]][key[1]] !== undefined) {
        loaded[key[0]][key[1]] = true;
      }
    } else {
      stop = true;
    }
  }

  return loaded;
};

// async.ajaxCall('https://api.meetup.com/2/categories?&sign=true&photo-host=public&key=457b71183481b13752d69755d97632')
// 	.then(x => console.log(x.results))

var time = {};

time.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

time.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

time.getKey = function (y, m, d) {
  return [y + '-' + (m < 9 ? '0' + (m + 1) : m + 1), '' + d];
  // return [`${y}-${time.months[m]}`, `${d}`]; <- Diff key format
};

time.getTimeObj = function (unix, offset) {
  var getTimeString = function getTimeString(t) {
    var hour = (t.hour + 11) % 12 + 1;
    var amPm = t.hour < 12 ? 'am' : 'pm';
    var min = t.min === 0 ? '00' : t.min;
    return time.daysOfWeek[t.weekDay] + ',' + ('' + time.months[t.month]) + (' ' + t.day + ', ' + hour + ':' + min + ' ' + amPm);
  };

  var date = new Date(unix - offset);

  var obj = {
    unix: new Date(unix),
    offset: offset,
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    min: date.getUTCMinutes(),
    weekDay: date.getUTCDay()
  };
  obj.timeString = getTimeString(obj);
  obj.key = time.getKey(obj.year, obj.month, obj.day);

  return obj;
};

time.now = time.getTimeObj(new Date(), new Date().getTimezoneOffset() * 60000);

// time.getDayLimit = (daysFromNow) =>
// {
// 	const now = time.now;
// 	const lastDay = new Date(now.year, now.month, now.day + daysFromNow);
//
// }

time.getWeekLimit = function (weeksFromNow) {
  var now = time.now;
  var day = now.day + (6 - now.weekDay) + weeksFromNow * 7;
  var lastDay = new Date(now.year, now.month, day);
  var end = lastDay.setHours(23, 59, 59, 999);
  var offset = new Date(end).getTimezoneOffset() * 60000;

  return time.getTimeObj(end, offset);
};

time.getMonthLimit = function (monthsFromNow) {
  var now = time.now;
  var lastDay = new Date(now.year, now.month + monthsFromNow + 1, 0);
  var end = lastDay.setHours(23, 59, 59, 999);
  var offset = new Date(end).getTimezoneOffset() * 60000;

  return time.getTimeObj(end, offset);
};

//
time.createCalendarObj = function (limit) {
  var tracker = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var now = time.now;
  var calendar = {};
  var months = [];
  var oneDay = 24 * 60 * 60 * 1000;

  var today = Date.UTC(now.year, now.month, now.day, 23, 59, 59, 999);
  var lastDay = Date.UTC(limit.year, limit.month, limit.day, 23, 59, 59, 999);

  var numDays = (lastDay - today) / oneDay;

  for (var i = 0; i <= numDays; i++) {
    var refDay = new Date(now.year, now.month, now.day + i);
    var key = time.getKey(refDay.getFullYear(), refDay.getMonth(), refDay.getDate());
    var m = key[0]; //`${refDay.getFullYear()}-${time.months[refDay.getMonth()]}`
    var d = key[1]; //`${refDay.getDate()}`
    if (!calendar[m]) {
      calendar[m] = {};months.push(m);
    }

    tracker ? calendar[m][d] = false : calendar[m][d] = [];
  }
  calendar;
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
        // console.log('ajax', x); // temp
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
  console.log('calls left ' + limit, ', reset in ' + reset + ' sec' // temp
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
    console.log('loc preset to [41.957819, -87.994403], fix it!');
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
async.overflowEvents = [];
async.findEvents = function (url, allEvents) {
  return new Promise(function (resolve, reject) {
    var parseData = function parseData(dt) {
      var events = task.clone(allEvents);
      // Forms the data
      var data = dt.data.map(function (x) {
        var obj = x;
        obj.loc = obj.venue ? [obj.venue.lat, obj.venue.lon] : null;
        obj.time = time.getTimeObj(obj.time, obj.utc_offset * -1);
        obj.duration = obj.duration / 60000 || null;
        obj.category = obj.group.category.name;
        delete obj.group.category;
        delete obj.utc_offset;
        delete obj.venue;
        return obj;
      });

      // Merge data with overflow
      var overflow = task.clone(async.overflowEvents);
      async.overflowEvents = [];
      var newData = data.concat(overflow);

      // Merge the data into existing calendar
      newData.map(function (x) {
        var key = x.time.key;
        if (!events[key[0]] || !events[key[0]][key[1]]) {
          async.overflowEvents.push(x);
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

// -- getCategories -- //
async.getCategories = function (url) {
  return new Promise(function (resolve) {
    function parseData(data) {
      var arr = [];
      data.results.map(function (x) {
        arr.push(x.name);
      });
      return arr;
    }
    async.ajaxCall(url).then(function (x) {
      return resolve(parseData(x));
    });
  });
};
// -- getCategories -- //

// This React class encapsulates the leaflet map

var Map = function (_React$Component) {
  _inherits(Map, _React$Component);

  function Map(props) {
    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));

    _this.centerMarker = L.marker();
    _this.centerRadius = L.circle();
    _this.markerCluster = L.markerClusterGroup();

    _this.initMap = function () {
      _this.mainMap = L.map('map').setView([38.366473, -96.262056], 5);
      var openstreetmaps = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org/">' + 'OpenStreetMap</a> contributors'
      });
      _this.mainMap.addLayer(openstreetmaps);
    };

    _this.newCenter = function (loc, rds) {
      _this.mainMap.removeLayer(_this.centerMarker);
      _this.mainMap.removeLayer(_this.centerRadius);

      _this.mainMap.flyTo(loc, 10, { duration: 3 });

      var centerIcon = L.divIcon({
        className: 'centerMarker',
        iconSize: new L.Point(50, 50),
        html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
      });
      _this.centerMarker = L.marker(loc, {
        icon: centerIcon,
        // interactive: false,
        title: 'Search Center'
      });

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
      _this.markerCluster.eachLayer(function (x) {
        return _this.markerCluster.removeLayer(x);
      });
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

        var marker = new L.marker(loc, { icon: icon }).bindPopup('<b>' + x.group.name + '</b>\n          <br/>' + x.name + '\n          <br/><i class="fa fa-clock-o" aria-hidden="true"></i>\n            ' + x.time.timeString + '\n          <br/><a href=\'' + x.link + '\' target=\'_blank\'>More Info</a>', { offset: [0, -5] }).bindTooltip('' + x.group.name, {
          offset: [0, -20],
          direction: 'top'
        });

        _this.markerCluster.addLayer(marker);
      });
      _this.mainMap.addLayer(_this.markerCluster);
    };

    return _this;
  } // <- main variable

  // -- initMap -- //

  // -- initMap -- //

  // -- newSearch -- //

  // -- newSearch -- //

  ////////////////////////////////////
  // Getting the bounds of a cluster
  //
  // When you receive an event from a cluster you can query it for the bounds.
  //
  // markers.on('clusterclick', function (a) {
  // 	var latLngBounds = a.layer.getBounds();
  // });
  ////////////////////////////////////

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
      if (this.props.center.length) {
        this.newCenter(this.props.center, this.props.radius);
      }
      if (this.props.events.length) {
        // console.log('render -> map', this.props.events); // temp
        this.putEventsOnMap(this.props.events);
      }
      return null;
    }
  }]);

  return Map;
}(React.Component);

var Controls = function (_React$Component2) {
  _inherits(Controls, _React$Component2);

  function Controls(props) {
    _classCallCheck(this, Controls);

    var _this2 = _possibleConstructorReturn(this, (Controls.__proto__ || Object.getPrototypeOf(Controls)).call(this, props));

    _this2.params = {
      lastDay: {},
      loadWeeks: 0, // 0 loads this month only
      monthKeys: [], // are created in order -- use as refrence
      categList: {},
      meta: {}
    };
    _this2.api = {
      key: '457b71183481b13752d69755d97632',
      omit: 'description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url',
      getEventUrl: function getEventUrl() {
        var loc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this2.state.search.loc;
        return 'https://api.meetup.com/find/events?' + '&sign=true&photo-host=public&' + ('lat=' + loc[0] + '&lon=' + loc[1]) + ('&radius=' + _this2.state.search.radius + '&fields=group_photo,group_category') + ('&omit=' + _this2.api.omit + '&key=' + _this2.api.key);
      },
      getCategoriesUrl: function getCategoriesUrl() {
        return 'https://api.meetup.com/2/categories?' + ('&sign=true&photo-host=public&key=' + _this2.api.key);
      }

      // -- filterEvents -- //
    };

    _this2.filterEvents = function () {
      var day = _this2.state.selected_day;
      var categories = _this2.state.selected_categ;
      var events = _this2.state.events[day[0]][day[1]];
      var filtered = void 0;
      if (!categories.length) {
        filtered = events;
      } else {
        filtered = events.filter(function (x) {
          return categories.indexOf(x.category) !== -1;
        });
      }

      _this2.setState({ setEventsOnMap: filtered });
    };

    _this2.newSearch = function () {}
    // TODO

    // -- newSearch -- //

    // -- setEventState -- //
    ;

    _this2.setEventState = function (data) {
      var tracker = task.updateDateTracker(_this2.state.loadedDates, data.lastEventTime);

      _this2.params.meta = data.meta;
      _this2.setState({ events: data.events, loadedDates: tracker });
    };

    _this2.todayIsLoaded = false;

    _this2.loadToday = function () {
      var forceLoad = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var key = _this2.state.selected_day;
      if (!_this2.todayIsLoaded || forceLoad) if (_this2.state.loadedDates[key[0]][key[1]] || forceLoad) {
        _this2.todayIsLoaded = true;
        _this2.filterEvents();
      }
    };

    _this2.findEventsLoop = function (loc, limit) {
      // let count = 0; // temp
      var loop = function loop(obj) {
        // count++; // temp
        _this2.loadToday();
        _this2.setEventState(obj);
        if (obj.meta.next_link && obj.lastEventTime.unix < limit.unix) {
          async.limiter(obj.meta).then(function () {
            // console.log('loop-'+count); // temp
            return async.findEvents(obj.meta.next_link + ('&key=' + _this2.api.key), _this2.state.events);
          }).then(function (x) {
            return loop(x);
          });
        } else {
          // set all days to loaded
          var end = task.clone(_this2.params.lastDay);
          end.day++;
          var tracker = task.updateDateTracker(_this2.state.loadedDates, end);
          _this2.setState({ loadedDates: tracker });

          _this2.loadToday(true);
          console.log(_this2.state.events); // temp
        }
      };
      // triger the loop
      async.findEvents(_this2.api.getEventUrl(loc), _this2.state.events).then(function (x) {
        return loop(x);
      });
    };

    _this2.componentDidMount = function () {
      var lastDay = time.getWeekLimit(_this2.params.loadWeeks);
      var calendarObj = time.createCalendarObj(lastDay);
      var tracker = time.createCalendarObj(lastDay, true);

      _this2.params.lastDay = lastDay;
      _this2.params.monthKeys = calendarObj.months;
      _this2.setState({
        events: calendarObj.calendar,
        loadedDates: tracker.calendar
        // TODO reinstate \/
        // filterParams: {day: [calendarObj.months[0], time.now.day], categories: []},
      });
      async.getCategories(_this2.api.getCategoriesUrl()).then(function (x) {
        _this2.params.categList = x;
        return async.geoLocate();
      }).then(function (x) {
        _this2.setState({ search: { loc: x, radius: _this2.state.search.radius } });
        return _this2.findEventsLoop(x, _this2.params.lastDay);
      });
    };

    _this2.state = {
      search: {
        radius: 35, // max 100.00 (miles)
        loc: [] // [38.366473, -96.262056]
      },
      events: {},
      loadedDates: {},
      selected_day: time.now.key, //time.getKey(2017, 8, 7),
      selected_categ: [], //["Tech", "Games"],
      setEventsOnMap: []
    };
    return _this2;
  }
  // -- filterEvents -- //

  // -- newSearch -- //

  // -- setEventState -- //

  // -- loadToday -- //

  // -- loadToday -- //

  // -- findEventsLoop -- //

  // -- findEventsLoop -- //

  // -- componentDidMount -- //


  _createClass(Controls, [{
    key: 'render',

    // -- componentDidMount -- //

    // -- render -- //
    value: function render() {
      if (this.state.setEventsOnMap.length) {
        this.setState({ setEventsOnMap: [] });
      }
      if (this.state.search.loc.length) {
        var rad = this.state.search.radius;
        this.setState({ search: { radius: rad, loc: [] } });
      }
      return React.createElement(
        'div',
        null,
        React.createElement(Map, {
          events: this.state.setEventsOnMap,
          center: this.state.search.loc,
          radius: this.state.search.radius
        })
      );
    }
    // -- render -- //

  }]);

  return Controls;
}(React.Component);

(function () {
  ReactDOM.render(React.createElement(Controls, null), document.getElementById('nav'));
  // render controls
  // find events
  // render map
})();