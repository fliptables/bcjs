/* jshint node:true */
require.config({
  baseUrl: '../src',
  shim: {
    Modernizr: {
      exports: 'Modernizr'
    }
  },
  deps: ['BetterContext'],
  packages: [
    { name: 'when', location: 'libs/when', main: 'when' }
  ],
  paths: {
    Modernizr: 'libs/modernizr/modernizr',
    almond: 'libs/almond/almond',
    Chart: 'libs/chartjs/Chart',
    URIjs: 'libs/URIjs/src',
    lodash: 'libs/lodash/lodash'
  }
});

