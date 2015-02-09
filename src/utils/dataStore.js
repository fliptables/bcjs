define(function (require) {

  var URI = require('URIjs/URI');
  var BASE_URI = '//www.bettercontext.com/api/user_ratings';
  var when = require('when');

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
      console.log('TODO IMPLEMENT SAVING', data);
      return when();
    },
    getRatingItems: function (options) {
      var user = options.user || this._user;
      var api = options.api || this._apiKey;
      var id = options.id;
      var url = options.serverbase || this._baseUrl || BASE_URI;

      url = new URI(url);

      url.search({
        user: user,
        api: api,
        id: id,
        item: id
      });

      return makeRequest(url.toString()).then(function(data) {
        return {
          labels: data.labels,
          results: data[id]
        };
      });
    },
    saveRating: function () {

    }
  };

  return DataStore;
});

