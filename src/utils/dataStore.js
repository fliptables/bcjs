define(function (require) {

  var URI = require('URIjs/URI');
  var _URI = '//www.bettercontext.com';
  var BASE_URI = '//www.bettercontext.com/api/user_ratings';

  var queryURI = new URI(BASE_URI);
  var postURI = new URI(BASE_URI);

	function makeRequest(method, uri){
		var xhr = new XMLHttpRequest();
    var defer = when.defer();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
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
    this._apiKey = '';
    this._userId = '';
    this._baseUrl = options.serverbase || BASE_URI;
  }

  DataStore.prototype = {
    setApi: function (key) {
      this._apiKey = key;
    },
    setUser: function (user) {
      this._user = user;
    },
    getRatingItems: function (limit) {

    },
    saveRating: function () {

    }
  };

  return DataStore;
});

