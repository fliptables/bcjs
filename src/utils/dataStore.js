define(function (require) {

  var URI = require('URIjs/URI');
  var BASE_URI = '//www.bettercontext.com/api/';
  var USER_ROUTE = 'user_ratings';
  var ITEM_ROUTE = 'item_ratings';
  var when = require('when');
  var _ = require('lodash');

	function makeRequest(uri, method){
		var xhr = new XMLHttpRequest();
    var defer = when.defer();
    method = method || 'GET';
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				var resp = xhr.responseText;
        if(xhr.status === 200) {
          try {
            defer.resolve(JSON.parse(resp));
          } catch (e) {
            defer.resolve(resp);
          }
        } else {
          defer.reject(xhr.statusText);
        }
			}
		};
		xhr.open(method, uri, true);
		xhr.send();
    return defer.promise;
	}


  function DataStore(options) {
    options = options || {};
    this._apiKey = options.api;
    this._user = options.user;
    this._baseUrl = options.serverbase || BASE_URI;
  }

  DataStore.prototype = {
    setApi: function (key) {
      this._apiKey = key;
    },
    setUser: function (user) {
      this._user = user;
    },
    saveRatingItem: function (options, data) {
      var user = options.user || this._user;
      var api = options.api || this._apiKey;
      var url = options.serverbase || this._baseUrl || BASE_URI;
      var ratingKey = encodeURIComponent('rating[]');
      var listQuery = '';
      var list = _.map(data, function (val) {
        return val.value;
      });

      url = new URI(url);

      if(!options.serverbase) {
        url.segment(USER_ROUTE);
      }

      url.search({
        'user_id': user,
        api: api,
        'site_id': options['site-id'],
        'item_id': options.id
      });

      _.each(list, function (rating) {
        listQuery += '&' + ratingKey + '=' + rating;
      });

      url = url.toString() + encodeURIComponent(listQuery);

      return makeRequest(url, 'POST');
    },
    getRatingItems: function (options) {
      var user = options.user || this._user;
      var api = options.api || this._apiKey;
      var id = options.id;
      var url = options.serverbase || this._baseUrl || BASE_URI;

      url = new URI(url);

      if(!options.serverbase) {
        url.segment(ITEM_ROUTE);
      }

      url.search({
        'user_id': user,
        api: api,
        'site_id': options['site-id'],
        'items[]': id
      });

      return makeRequest(url.toString()).then(function(data) {
        var out = _.transform(data[id], function (out, item, key) {
          var results;
          var ratings;
          if(key.indexOf('m') === 0) {
            results = out.results || {};
            results[key] = item;
            out.results = results;
          } else if(key.indexOf('u') === 0) {
            ratings = out.ratings || {};
            ratings[key] = item;
            out.ratings = ratings;
          }
          // unknown key type
          return out;
        });
        out.labels = data.labels;
        return out;
      });
    }
  };

  return DataStore;
});

