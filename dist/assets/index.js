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
    var hour = (t.hour + 11) % 12 + 1;
    var amPm = t.hour < 12 ? 'am' : 'pm';
    var min = t.min < 10 ? '0' + t.min : t.min;
    return time.daysOfWeek[t.weekDay] + ',' + (' ' + time.months[t.month]) + (' ' + t.day + ', ' + hour + ':' + min + ' ' + amPm);
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

time.updateDateTracker = function (tracker, limit) {
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
    if (limit <= 10) {
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
    async.ajaxCall('https://geocode.xyz/' + locStr + '%20usa?geoit=json').then(function (x) {
      return resolve([x.latt.x.longt]);
    });
  });
};

var Controls = function (_React$Component) {
  _inherits(Controls, _React$Component);

  function Controls(props) {
    _classCallCheck(this, Controls);

    var _this = _possibleConstructorReturn(this, (Controls.__proto__ || Object.getPrototypeOf(Controls)).call(this, props));

    _this.params = {
      events: {},
      meta: {},
      timeLimit: time.getDayLimit(1),
      radius_range: [5, 10, 25, 35, 50, 100]
    };
    _this.api = {
      key: apiKey.meetup || console.log('MEETUP API KEY ERROR'),
      omit: 'description,visibility,created,id,status,updated,waitlist_count,yes_rsvp_count,venue.name,venue.id,venue.repinned,venue.address_1,venue.address_2,venue.city,venue.country,venue.localized_country_name,venue.phone,venue.zip,venue.state,group.created,group.id,group.join_mode,group.who,group.localized_location,group.region,group.category.sort_name,group.photo.id,group.photo.highres_link,group.photo.photo_link,group.photo.type,group.photo.base_url',
      getEventUrl: function getEventUrl(latLon, radius) {
        return 'https://api.meetup.com/find/events?' + '&sign=true&photo-host=public&' + ('lat=' + latLon[0] + '&lon=' + latLon[1]) + ('&radius=' + radius + '&fields=group_photo,group_category') + ('&omit=' + _this.api.omit) + ('&key=' + _this.api.key);
      },
      getCategoriesUrl: function getCategoriesUrl() {
        return 'https://api.meetup.com/2/categories?' + ('&sign=true&photo-host=public&key=' + _this.api.key);
      },
      addKey: function addKey(url) {
        return url + ('&key=' + _this.api.key);
      }
    };

    _this.newSearch = function (loc, radius) {
      var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _this.params.timeLimit;

      _this.params.timeLimit = limit;
      _this.params.events = time.createCalendarObj(limit);
      _this.todayIsLoaded = false;
      _this.setState({ tracker: time.createCalendarObj(limit, true) });
      _this.eventsFindLoop(loc, radius, limit);
    };

    _this.setEventState = function (data) {
      var tracker = time.updateDateTracker(_this.state.tracker, data.lastEventTime);

      _this.params.events = data.events;
      _this.setState({ tracker: tracker });
    };

    _this.setLocName = function (loc) {
      async.reverseGeo(loc).then(function (x) {
        return _this.setState({ locName: x });
      });
    };

    _this.geocodeLatLon = function (locStr) {
      async.geocode(locStr).then(function (x) {
        setLocName(x);
        _this.setState({ latLon: x });
        _this.newSearch(x, _this.state.radius);
      });
    };

    _this.filterEvents = function () {
      var day = _this.state.selected_day.key;
      var categ = _this.state.selected_categ;
      var events = _this.params.events[day[0]][day[1]];
      var filtered = void 0;
      if (!categ.length) {
        filtered = events;
      } else {
        filtered = events.filter(function (x) {
          return categ.indexOf(x.category) !== -1;
        });
      }

      _this.setState({ eventsOnMap: filtered });
    };

    _this.todayIsLoaded = false;

    _this.loadToday = function () {
      var forceLoad = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var key = _this.state.selected_day.key;
      if (!_this.todayIsLoaded || forceLoad) if (_this.state.tracker[key[0]][key[1]] || forceLoad) {
        _this.todayIsLoaded = true;
        _this.filterEvents();
      }
    };

    _this.eventsFindLoop = function (loc, radius, limit) {
      var loop = function loop(obj) {
        _this.loadToday();
        _this.setEventState(obj);
        if (obj.meta.next_link && obj.lastEventTime.unix < limit.unix) {
          async.limiter(obj.meta).then(function () {
            // console.log('loop-'+count); // temp
            return async.findEvents(_this.api.addKey(obj.meta.next_link), _this.params.events);
          }).then(function (x) {
            return loop(x);
          });
        } else {
          // set all tracker days to loaded
          limit.day++;
          var tracker = time.updateDateTracker(_this.state.tracker, limit);
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

    _this.setRadius = function (r) {
      _this.setState({ radius: r });
      _this.newSearch(_this.state.latLon, r);
    };

    _this.componentDidMount = function () {
      async.getCategories(_this.api.getCategoriesUrl()).then(function (x) {
        _this.setState({ categList: x });
        return async.geoLocate();
      }).then(function (x) {
        _this.setState({ latLon: x });
        _this.setLocName(x);
        return _this.newSearch(x, _this.state.radius);
      });
    };

    _this.state = {
      radius: 25, // max 100.00 (miles)
      latLon: [],
      locName: '...',

      categList: {},
      selected_day: time.now, //time.getTimeObj(new Date(2017, 8, 7), new Date(2017, 8, 7).getTimezoneOffset() * 60000),//
      selected_categ: [], //["Tech", "Games"],

      tracker: {}, // for loaded days
      eventsOnMap: []
    };
    return _this;
  }

  // -- newSearch -- //

  // -- newSearch -- //

  // -- setEventState -- //

  // -- setEventState -- //

  // -- setLocName -- //

  // -- setLocName -- //

  // -- geocodeLatLon -- //

  // -- geocodeLatLon -- //

  // -- filterEvents -- //

  // -- filterEvents -- //

  // -- loadToday -- //

  // -- loadToday -- //

  // -- eventsFindLoop -- //

  // -- eventsFindLoop -- //

  // -- setRadius -- //

  // -- setRadius -- //

  // -- componentDidMount -- //


  _createClass(Controls, [{
    key: 'render',

    // -- componentDidMount -- //

    // -- render -- //
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(Map, {
          events: this.state.eventsOnMap,
          latLon: this.state.latLon,
          radius: this.state.radius
        }),
        React.createElement(Nav, {
          date: this.state.selected_day,
          eventsFound: this.state.eventsOnMap.length,
          radius_range: this.params.radius_range,
          radius_onClick: this.setRadius,
          radius: this.state.radius,
          loc: this.state.locName
        })
      );
    }
    // -- render -- //

  }]);

  return Controls;
}(React.Component);

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
  var date = time.daysOfWeek[props.date.weekDay] + ', ' + time.months[props.date.month] + ' ' + props.date.day;
  var radius_range = props.radius_range.map(function (x) {
    return React.createElement(
      'li',
      {
        id: 'radius-' + x,
        className: props.radius === x ? 'active' : '',
        onClick: function onClick() {
          return props.radius_onClick(x);
        }
      },
      x,
      ' miles'
    );
  });
  console.log(props.eventsFound);
  return React.createElement(
    'nav',
    { className: 'nav' },
    React.createElement(
      'h1',
      null,
      'Meetup Map Search'
    ),
    React.createElement(
      'p',
      null,
      '... events in the next 7 days'
    ),
    React.createElement(
      'div',
      { className: 'search' },
      React.createElement(
        'div',
        { className: 'search_selector' },
        React.createElement(
          'div',
          null,
          props.eventsFound,
          ' meetups within'
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'span',
            { className: 'search_radius', id: 'radius' },
            props.radius,
            ' miles',
            ' ',
            React.createElement('i', { className: 'fa fa-map-o', 'aria-hidden': 'true' })
          ),
          React.createElement(
            'div',
            { className: 'popup', id: 'radius-popup' },
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
            { className: 'search_location', id: 'location' },
            props.loc + ' ',
            React.createElement('i', { className: 'fa fa-map-marker', 'aria-hidden': 'true' })
          ),
          React.createElement(
            'div',
            { className: 'popup', id: 'location-popup' },
            React.createElement('input', {
              id: 'location-input',
              type: 'text',
              placeholder: 'City or postal code'
            })
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
            { className: 'search_calendar', id: 'calendar' },
            date + ' ',
            React.createElement('i', { className: 'fa fa-calendar', 'aria-hidden': 'true' })
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'search_filter-toggle' },
        React.createElement('i', { className: 'fa fa-sort-desc', 'aria-hidden': 'true' })
      ),
      React.createElement(
        'div',
        { className: 'search_filter' },
        React.createElement('div', { className: 'search_filter_categ' }),
        React.createElement('div', { className: 'search_filter_calendar' })
      )
    )
  );
}

var nav = {};
nav['radius'] = false;
nav['location'] = false;

window.onload = function () {
  // radius
  document.getElementById('radius').addEventListener('click', function () {
    document.getElementById('radius-popup').style.display = 'none';
    document.getElementById('location-popup').style.display = 'none';
    if (!nav['radius']) {
      nav['radius'] = true;
      nav['location'] = false;
      document.getElementById('radius-popup').style.display = 'block';
    } else {
      nav['radius'] = false;
      nav['location'] = false;
    }
  });
  // location
  document.getElementById('location').addEventListener('click', function () {
    document.getElementById('radius-popup').style.display = 'none';
    document.getElementById('location-popup').style.display = 'none';
    if (!nav['location']) {
      nav['location'] = true;
      nav['radius'] = false;
      document.getElementById('location-popup').style.display = 'block';
      document.getElementById('location-input').focus();
    } else {
      nav['radius'] = false;
      nav['location'] = false;
    }
  });
};

(function () {
  ReactDOM.render(React.createElement(Controls, null), document.getElementById('controls'));
})();