'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//@prepros-append babel/helper.js
//@prepros-append babel/time.js
//@prepros-append babel/async.js

//@prepros-append babel/controls.js
//@prepros-append babel/map.js
//@prepros-append babel/nav.js

//@prepros-append babel/start.js

var task = {};

// -- clone -- //
task.clone = function (obj) {
  var clone = JSON.stringify(obj);
  return JSON.parse(clone);
};
// -- clone -- //

// -- isEqual -- //
task.isEqual = function (obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};
// -- isEqual -- //

// -- capitalizeWords -- //
task.capitalizeWords = function (x) {
  var str = x.toLowerCase();
  var arr = str.split(' ');
  arr = arr.map(function (x) {
    return x.charAt(0).toUpperCase() + x.slice(1);
  });
  return arr.join(' ');
};
// -- capitalizeWords -- //

var time = {};

time.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

time.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

time.getKey = function (y, m, d) {
  // return [`${y}-${m < 9 ? '0' + (m + 1): m + 1}`, `${d}`]; <- Diff key format
  return [y + '-' + time.months[m], '' + d];
};

time.getTimeObj = function (unix, offset) {
  var getTimeString = function getTimeString(t) {
    var shortForm = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var hour = (t.hour + 11) % 12 + 1;
    var amPm = t.hour < 12 ? 'am' : 'pm';
    var min = t.min < 10 ? '0' + t.min : t.min;
    if (!shortForm) {
      return time.daysOfWeek[t.weekDay] + ',' + (' ' + time.months[t.month]) + (' ' + t.day + ', ' + hour + ':' + min + ' ' + amPm);
    } else {
      return time.daysOfWeek[t.weekDay] + ',' + (' ' + time.months[t.month]) + (' ' + t.day);
    }
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
  obj.weekString = '' + time.daysOfWeek[obj.weekDay];
  obj.monthString = '' + time.months[obj.month];
  obj.timeString = getTimeString(obj);
  obj.timeStringShort = getTimeString(obj, true);
  obj.key = time.getKey(obj.year, obj.month, obj.day);

  return obj;
};

time.now = time.getTimeObj(new Date(), new Date().getTimezoneOffset() * 60000);

time.getDayLimit = function (daysFromNow) {
  var now = time.now;
  var lastDay = new Date(now.year, now.month, now.day + daysFromNow);
  var end = lastDay.setHours(23, 59, 59, 999);
  var offset = new Date(end).getTimezoneOffset() * 60000;

  return time.getTimeObj(end, offset);
};

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

time.createWeekObj = function (weeksFromNow) {
  var weekObj = [];
  var day = time.getDayLimit(0);
  var week = time.getWeekLimit(weeksFromNow);
  var t = (week.unix - day.unix) / 1000 / 60 / 60 / 24;
  while (weekObj.length < 7) {
    var tempObj = time.getDayLimit(t);
    if (t < 0) {
      tempObj.inactive = true;
    }
    weekObj.unshift(tempObj);
    t--;
  }
  return weekObj;
};

time.createCalendarObj = function (limit) {
  var tracker = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var now = time.now;
  var calendar = {};
  var oneDay = 24 * 60 * 60 * 1000;

  var today = Date.UTC(now.year, now.month, now.day, 23, 59, 59, 999);
  var lastDay = Date.UTC(limit.year, limit.month, limit.day, 23, 59, 59, 999);

  var numDays = (lastDay - today) / oneDay;

  for (var i = 0; i <= numDays; i++) {
    var refDay = new Date(now.year, now.month, now.day + i);
    var key = time.getKey(refDay.getFullYear(), refDay.getMonth(), refDay.getDate());
    var m = key[0],
        d = key[1];
    if (!calendar[m]) {
      calendar[m] = {};
    }

    tracker ? calendar[m][d] = false : calendar[m][d] = [];
  }
  return calendar;
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
  console.log('calls left ' + limit, ', reset in ' + reset + ' sec'); // temp
  return new Promise(function (resolve, reject) {
    if (limit <= 5) {
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
    var options = { maximumAge: Infinity };
    var success = function success(pos) {
      var crd = pos.coords;
      resolve([crd.latitude, crd.longitude]);
    };
    var error = function error(err) {
      resolve(false);
    };
    navigator.geolocation.getCurrentPosition(success, error, options);
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
        if (!obj.group.category) {
          console.log('No Category!', obj);return;
        }
        obj.category = obj.group.category.name;
        delete obj.group.category;
        delete obj.utc_offset;
        delete obj.venue;
        return obj;
      });

      // Merge data with overflow
      // let overflow = task.clone(async.overflowEvents);
      // async.overflowEvents = [];
      // let newData = data.concat(overflow);

      // Merge the data into existing calendar
      data.map(function (x) {
        if (!x) {
          console.log('Undefined!');return;
        }
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

// -- reverseGeo -- //
async.reverseGeo = function (loc) {
  return new Promise(function (resolve) {
    async.ajaxCall('https://geocode.xyz/' + loc[0] + ',' + loc[1] + '?geoit=json').then(function (x) {
      var state = x.prov.toUpperCase();
      var city = task.capitalizeWords(x.city);
      resolve(city + ', ' + state);
    });
  });
};
// -- reverseGeo -- //

// -- geocode -- //
async.geocode = function (locStr) {
  return new Promise(function (resolve) {
    async.ajaxCall('https://geocode.xyz/' + locStr + '?geoit=json').then(function (x) {
      if (x.error) {
        console.log('x.error', x);
        console.log('geocode error handeled');
        resolve([false, 'Location Not Found, Please Try Again']);
        return;
      }
      if (x.standard.countryname === 'United States of America') {
        console.log('success geocode', x);
        resolve([true, [x.latt, x.longt]]);
      } else {
        console.log('fail geocode', x);
        resolve(async.geocode(locStr + '%20usa'));
      }
    });
  });
};
// -- geocode -- //

var Controls = function (_React$Component) {
  _inherits(Controls, _React$Component);

  function Controls(props) {
    _classCallCheck(this, Controls);

    var _this = _possibleConstructorReturn(this, (Controls.__proto__ || Object.getPrototypeOf(Controls)).call(this, props));

    _this.weekLimit = 4;
    _this.params = {
      events: {},
      meta: {},
      timeLimit: time.getWeekLimit(_this.weekLimit),
      radius_range: [5, 10, 25, 35, 50, 100]
    };
    _this.api = {
      token: /#access_token=\s*(.*?)\s*&/g.exec(window.location.href)[1],
      // token: 'eef7e98fd4c8314c1a95860958978860',
      omit: 'description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url',
      getEventUrl: function getEventUrl(latLon, radius) {
        return 'https://api.meetup.com/find/events?' + '&sign=true&photo-host=public&' + ('lat=' + latLon[0] + '&lon=' + latLon[1]) + ('&radius=' + radius + '&fields=group_photo,group_category') + ('&omit=' + _this.api.omit) + ('&access_token=' + _this.api.token);
      },
      getCategoriesUrl: function getCategoriesUrl() {
        return 'https://api.meetup.com/2/categories?' + ('&sign=true&photo-host=public&access_token=' + _this.api.token);
      },
      addKey: function addKey(url) {
        return url + ('&access_token=' + _this.api.token);
      }
    };

    _this.newSearch = function (loc, radius) {
      var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _this.params.timeLimit;

      _this.setToggle('all');
      if (!loc) {
        _this.setState({ locErr: true });return;
      }

      _this.params.timeLimit = limit;
      _this.params.events = time.createCalendarObj(limit);
      _this.todayIsLoaded = false;
      _this.setLocName(loc);
      _this.setWeek(-1, true);
      _this.setState({
        tracker: time.createCalendarObj(limit, true),
        latLon: loc,
        locErr: false,
        locInputValue: ''
      });
      _this.eventsFindLoop(loc, radius, limit);
    };

    _this.setTracker = function (tracker, limit) {
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
      _this.setWeek();
      return loaded;
    };

    _this.setToggle = function (target) {
      if (target === 'all') {
        _this.setState({ toggle: _this.popupClosedState });
      }
      var tempObj = task.clone(_this.popupClosedState);
      tempObj[target] = !_this.state.toggle[target];
      _this.setState({ toggle: tempObj });
    };

    _this.setCateg = function (target) {
      var tempArr = _this.state.selected_categ;
      var idx = tempArr.indexOf(target);
      if (idx === -1) {
        tempArr.push(target);
      } else {
        delete tempArr[idx];
        tempArr = tempArr.filter(function (x) {
          return x;
        });
      }
      _this.setState({ selected_categ: tempArr });
      _this.setWeek(0, false, tempArr);
      _this.setEventsOnMap(tempArr);
    };

    _this.setDate = function (date) {
      _this.setState({ selected_day: date });
      _this.setEventsOnMap(_this.state.selected_categ, date.key);
    };

    _this.setWeek = function () {
      var adj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var categ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _this.state.selected_categ;

      var w = _this.state.selected_week + adj;
      if (reset) {
        w = 0;
      }
      if (w < 0 || w > _this.weekLimit) {
        return;
      }
      var tempArr = time.createWeekObj(w);
      tempArr.map(function (x, i) {
        tempArr[i].length = _this.filterEvents(categ, x.key).length;
      });
      _this.setState({ selected_week: w, week: tempArr });
    };

    _this.setEventState = function (data) {
      var tracker = _this.setTracker(_this.state.tracker, data.lastEventTime);

      _this.params.events = data.events;
      _this.setState({ tracker: tracker });
    };

    _this.setLocName = function (loc) {
      async.reverseGeo(loc).then(function (x) {
        return _this.setState({ locName: x });
      });
    };

    _this.setRadius = function (r) {
      _this.setState({ radius: r });
      _this.newSearch(_this.state.latLon, r);
    };

    _this.setLatLonViaGeocode = function () {
      var locStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.state.locInputValue;

      async.geocode(locStr).then(function (x) {
        if (!x[0]) {
          _this.setState({ locErrMessage: x[1], locErr: true });
          return;
        }
        _this.newSearch(x[1], _this.state.radius);
      });
    };

    _this.handleChange_locValue = function (e) {
      _this.setState({ locInputValue: e.target.value });
    };

    _this.filterEvents = function (categ, key) {
      var events = _this.params.events[key[0]][key[1]];
      var filtered = void 0;
      if (!categ.length) {
        filtered = events;
      } else if (!events) {
        events = [];
      } else {
        filtered = events.filter(function (x) {
          return categ.indexOf(x.category) !== -1;
        });
      }
      if (filtered === undefined) {
        filtered = [];
      }
      return filtered;
    };

    _this.setEventsOnMap = function () {
      var categ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _this.state.selected_categ;
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _this.state.selected_day.key;

      _this.setState({ eventsOnMap: _this.filterEvents(categ, key) });
    };

    _this.todayIsLoaded = false;

    _this.loadToday = function () {
      var forceLoad = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var key = _this.state.selected_day.key;
      if (!_this.todayIsLoaded || forceLoad) if (_this.state.tracker[key[0]][key[1]] || forceLoad) {
        _this.todayIsLoaded = true;
        _this.setEventsOnMap();
      }
    };

    _this.eventsFindLoop = function (loc, radius, limit) {
      var loop = function loop(obj) {
        _this.loadToday();
        _this.setEventState(obj);
        if (obj.meta.next_link && obj.lastEventTime.unix < limit.unix) {
          async.limiter(obj.meta).then(function () {
            return async.findEvents(_this.api.addKey(obj.meta.next_link), _this.params.events);
          }).then(function (x) {
            return loop(x);
          });
        } else {
          // set all tracker days to loaded
          limit.day++;
          var tracker = _this.setTracker(_this.state.tracker, limit);
          _this.setState({ tracker: tracker });

          _this.loadToday(true);
          console.log(_this.params.events); // temp
        }
      };
      // triger the loop
      async.findEvents(_this.api.getEventUrl(loc, radius), _this.params.events).then(function (x) {
        return loop(x);
      });
    };

    _this.componentDidMount = function () {
      _this.popupClosedState = task.clone(_this.state.toggle);
      async.getCategories(_this.api.getCategoriesUrl()).then(function (x) {
        _this.setState({ categList: x });
        return async.geoLocate();
      }).then(function (x) {
        return _this.newSearch(x, _this.state.radius);
      });
    };

    _this.locErr_submitForm = function (e) {
      e.preventDefault();
      _this.setLatLonViaGeocode();
    };

    _this.state = {
      radius: 25, // max 100.00 (miles)
      latLon: [],
      locName: '...',

      categList: [],
      selected_day: time.getDayLimit(0),
      selected_categ: [],

      tracker: {}, // for loaded days
      eventsOnMap: [],

      locErr: false,
      locErrMessage: '',
      locInputValue: '',

      selected_week: 0,
      week: [{}, {}, {}, {}, {}, {}, {}],

      toggle: {
        radius: false,
        location: false,
        filter: false
      }
    };
    return _this;
  }

  // -- newSearch -- //

  // -- newSearch -- //

  // -- setTracker -- //

  // -- setTracker -- //

  // -- setToggle --//
  // defined in componentDidMount

  // -- setToggle --//

  // -- setCateg -- //

  // -- setCateg -- //

  // -- setDate -- //

  // -- setDate -- //

  // -- setWeek -- //

  // -- setWeek -- //

  // -- setEventState -- //

  // -- setEventState -- //

  // -- setLocName -- //

  // -- setLocName -- //

  // -- setRadius -- //

  // -- setRadius -- //

  // -- geocodeLatLon -- //

  // -- geocodeLatLon -- //

  // -- handleChange_locValue -- //

  // -- handleChange_locValue -- //

  // -- filterEvents -- //

  // -- filterEvents -- //

  // -- setEventsOnMap -- //

  // -- setEventsOnMap -- //

  // -- loadToday -- //

  // -- loadToday -- //

  // -- eventsFindLoop -- //

  // -- eventsFindLoop -- //

  // -- componentDidMount -- //

  // -- componentDidMount -- //

  _createClass(Controls, [{
    key: 'render',


    // -- render -- //
    value: function render() {
      var err = this.state.locErrMessage;
      var errMsg = err !== '' ? React.createElement(
        'h4',
        null,
        err
      ) : null;
      return React.createElement(
        'div',
        { id: 'controls' },
        React.createElement(Map, {
          events: this.state.eventsOnMap,
          latLon: this.state.latLon,
          radius: this.state.radius
        }),
        React.createElement(Nav, {
          categ_list: this.state.categList,
          categ_stateOf: this.state.selected_categ,
          categ_onClick: this.setCateg,
          toggle: this.setToggle,
          toggle_stateOf: this.state.toggle,
          date: this.state.selected_day,
          date_set: this.setDate,
          week: this.state.week,
          week_set: this.setWeek,
          week_selected: this.state.selected_week,
          week_limit: this.weekLimit,
          loadStatus: this.state.tracker,
          eventsFound: this.state.eventsOnMap.length,
          radius_range: this.params.radius_range,
          radius_onClick: this.setRadius,
          radius: this.state.radius,
          loc_onSubmit: this.setLatLonViaGeocode,
          loc_inputValue: this.state.locInputValue,
          loc_inputHandleChange: this.handleChange_locValue,
          loc: this.state.locName
        }),
        React.createElement(
          'div',
          {
            className: 'locErrHandler',
            style: this.state.locErr ? { display: 'inline' } : { display: 'none' }
          },
          errMsg,
          React.createElement(
            'form',
            { onSubmit: this.locErr_submitForm },
            React.createElement('input', {
              type: 'text',
              placeholder: 'City or postal code',
              onChange: this.handleChange_locValue,
              value: this.state.locInputValue
            })
          )
        )
      );
    }
  }]);

  return Controls;
}(React.Component);

// -- render -- //
;

// This React class encapsulates the leaflet map

var Map = function (_React$Component2) {
  _inherits(Map, _React$Component2);

  function Map(props) {
    _classCallCheck(this, Map);

    var _this2 = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, props));

    _this2.centerMarker = L.marker();
    _this2.centerRadius = L.circle();
    _this2.markerCluster = L.markerClusterGroup();

    _this2.initMap = function () {
      _this2.mainMap = L.map('map', { zoomControl: false }).setView([38.366473, -96.262056], 5);

      var zoomBtns = L.control.zoom({
        position: 'bottomright'
      }).addTo(_this2.mainMap);
      var tiles = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org/">' + 'OpenStreetMap</a> contributors'
      });
      // const tiles = new L.tileLayer(
      //   'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
      //   {
      //     id: 'outdoors-v10',
      //     accessToken: apiKey.mapbox || console.log('MAPBOX API KEY ERROR'),
      //     attribution: '&copy; <a href="http://mapbox.com/">'
      //     +'Mapbox</a> &copy; <a href="http://openstreetmap.org/">'
      //     +'OpenStreetMap</a>'
      //   }
      // );
      _this2.mainMap.addLayer(tiles);
    };

    _this2.newSearchParams = function (loc, rds) {
      _this2.mainMap.removeLayer(_this2.centerMarker);
      _this2.mainMap.removeLayer(_this2.centerRadius);

      _this2.mainMap.flyTo(loc, 10, { duration: 3 });

      var centerIcon = L.divIcon({
        className: 'centerMarker',
        iconSize: new L.Point(50, 50),
        html: '<div><i class="fa fa-compass" aria-hidden="true"></i></div>'
      });
      _this2.centerMarker = L.marker(loc, {
        icon: centerIcon,
        // interactive: false,
        title: 'Search Center'
      });

      _this2.mainMap.addLayer(_this2.centerMarker);

      _this2.centerRadius = L.circle(loc, {
        radius: 1609.344 * rds,
        interactive: false,
        fillOpacity: 0.07,
        opacity: 0.4
      });
      _this2.mainMap.addLayer(_this2.centerRadius);
    };

    _this2.putEventsOnMap = function (events) {
      _this2.markerCluster.eachLayer(function (x) {
        return _this2.markerCluster.removeLayer(x);
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

        _this2.markerCluster.addLayer(marker);
      });
      _this2.mainMap.addLayer(_this2.markerCluster);
    };

    _this2.state = {
      events: [],
      latLon: [],
      radius: 25
    };
    return _this2;
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
    key: 'componentWillMount',

    // -- putEventsOnMap -- //

    value: function componentWillMount() {
      this.initMap();
    }
  }, {
    key: 'render',
    value: function render() {
      if (!task.isEqual(this.props.latLon, this.state.latLon) || !task.isEqual(this.props.radius, this.state.radius)) {
        this.setState({ latLon: this.props.latLon, radius: this.props.radius });
        if (this.props.latLon.length) {
          this.newSearchParams(this.props.latLon, this.props.radius);
        }
      }
      if (!task.isEqual(this.props.events, this.state.events)) {
        this.setState({ events: this.props.events });
        this.putEventsOnMap(this.props.events);
      }
      return null;
    }
  }]);

  return Map;
}(React.Component);

function Nav(props) {
  var date = props.date.timeStringShort;
  var week = props.week.map(function (x, i) {
    if (x.inactive) {
      return React.createElement(
        'div',
        { className: 'inactive' },
        React.createElement(
          'span',
          null,
          x.weekString,
          React.createElement(
            'span',
            { className: 'mobile-hide' },
            ' ' + x.monthString + ' ' + x.day
          )
        ),
        React.createElement(
          'div',
          { className: 'text' },
          React.createElement('i', { className: 'fa fa-calendar-times-o' })
        )
      );
    }

    return React.createElement(
      'div',
      {
        className: props.date.timeString === x.timeString ? 'selected' : '',
        onClick: function onClick() {
          return props.date_set(x);
        }
      },
      React.createElement(
        'span',
        null,
        x.weekString,
        React.createElement(
          'span',
          { className: 'mobile-hide' },
          ' ' + x.monthString + ' ' + x.day
        )
      ),
      React.createElement(
        'div',
        { className: 'text' },
        x.key && props.loadStatus[x.key[0]] && props.loadStatus[x.key[0]][x.key[1]] ? React.createElement(
          'span',
          null,
          x.length,
          React.createElement('br', null),
          React.createElement(
            'span',
            { className: 'text-mobile' },
            ' event',
            x.length !== 1 ? 's' : ''
          )
        ) : React.createElement(
          'span',
          null,
          React.createElement('i', { className: 'fa fa-spinner fa-pulse fa-3x fa-fw' })
        )
      )
    );
  });

  var weekTitle = function weekTitle(w) {
    var x = void 0;
    if (w === 0) {
      x = 'This Week';
    } else if (w === 1) {
      x = 'Next Week';
    } else {
      var t = props.week[0];
      x = 'Week of ' + t.timeStringShort.slice(5) + ', ' + t.year;
      // TODO month, day Year
    }
    return x;
  };

  var weekFilter = React.createElement(
    'div',
    { className: 'search_filter_week' },
    React.createElement(
      'h3',
      null,
      React.createElement('i', {
        onClick: function onClick() {
          return props.week_set(-1);
        },
        className: 'fa fa-arrow-left arrow',
        'aria-hidden': 'true',
        style: props.week_selected ? {} : { color: 'hsl(0, 0%, 65%)', cursor: 'inherit' }
      }),
      ' ' + weekTitle(props.week_selected) + ' ',
      React.createElement('i', {
        onClick: function onClick() {
          return props.week_set(+1);
        },
        className: 'fa fa-arrow-right arrow',
        'aria-hidden': 'true',
        style: props.week_selected < props.week_limit ? {} : { color: 'hsl(0, 0%, 65%)', cursor: 'inherit' }
      })
    ),
    React.createElement(
      'div',
      { className: 'week_main' },
      week
    )
  );

  var radius_range = props.radius_range.map(function (x) {
    return React.createElement(
      'li',
      {
        id: 'radius-' + x,
        className: props.radius === x ? 'active' : '',
        onClick: function onClick() {
          props.toggle('radius');
          props.radius_onClick(x);
        }
      },
      x,
      ' miles'
    );
  });

  var categList = props.categ_list.map(function (x) {
    var name = props.categ_stateOf.indexOf(x) !== -1 ? 'on' : 'off';
    return React.createElement(
      'span',
      {
        onClick: function onClick() {
          return props.categ_onClick(x);
        },
        className: name
      },
      x
    );
  });

  function handleSubmit(e) {
    e.preventDefault();
    props.loc_onSubmit();
  }
  return React.createElement(
    'nav',
    { className: 'nav' },
    React.createElement(
      'h1',
      null,
      'Meetup Map Search'
    ),
    React.createElement(
      'div',
      { className: 'search' },
      React.createElement(
        'div',
        { className: 'search_selector' },
        React.createElement(
          'div',
          { className: 'mobile-hide' },
          props.eventsFound,
          ' meetup',
          props.eventsFound !== 1 ? 's' : '',
          ' within'
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'span',
            {
              className: 'search_radius',
              onClick: function onClick() {
                props.toggle('radius');
              },
              id: 'radius' },
            props.radius,
            ' miles',
            ' ',
            React.createElement('i', { className: 'fa fa-map-o', 'aria-hidden': 'true' })
          ),
          React.createElement(
            'div',
            {
              className: 'popup',
              id: 'radius-popup',
              style: props.toggle_stateOf.radius ? {} : { display: 'none' }
            },
            React.createElement(
              'ul',
              null,
              radius_range
            )
          )
        ),
        React.createElement(
          'div',
          null,
          'of'
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'span',
            {
              className: 'search_location',
              id: 'location',
              onClick: function onClick() {
                props.toggle('location');
              }
            },
            props.loc + ' ',
            React.createElement('i', { className: 'fa fa-map-marker', 'aria-hidden': 'true' })
          ),
          React.createElement(
            'div',
            {
              className: 'popup',
              id: 'location-popup',
              style: props.toggle_stateOf.location ? {} : { display: 'none' }
            },
            React.createElement(
              'form',
              { id: 'location-search', onSubmit: handleSubmit },
              React.createElement('input', {
                id: 'location-input',
                type: 'text',
                name: 'location-input',
                onChange: props.loc_inputHandleChange,
                value: props.loc_inputValue,
                placeholder: 'City or postal code'
              })
            )
          )
        ),
        React.createElement(
          'div',
          null,
          'on'
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'span',
            {
              className: 'search_date',
              onClick: function onClick() {
                props.toggle('filter');
              },
              id: 'date' },
            date + ' ',
            React.createElement('i', { className: 'fa fa-calendar', 'aria-hidden': 'true' })
          )
        )
      ),
      React.createElement(
        'div',
        {
          className: 'search_filter ' + (props.toggle_stateOf.filter ? 'on' : 'off')
        },
        React.createElement('div', { className: 'line' }),
        weekFilter,
        React.createElement(
          'h3',
          null,
          'Categories'
        ),
        React.createElement(
          'div',
          { className: 'search_filter_categ' },
          categList
        )
      ),
      React.createElement(
        'div',
        {
          className: 'search_filter-toggle',
          onClick: function onClick() {
            props.toggle('filter');
          }
        },
        props.toggle_stateOf.filter ? React.createElement('i', { className: 'fa fa-sort-asc', 'aria-hidden': 'true' }) : React.createElement('i', { className: 'fa fa-sort-desc', 'aria-hidden': 'true' })
      )
    )
  );
}

(function () {
  ReactDOM.render(React.createElement(Controls, null), document.getElementById('controls'));
})();