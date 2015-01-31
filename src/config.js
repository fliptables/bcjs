require.config({
  baseUrl: '../src',
  deps: ['BetterContext'],
  packages: [
    { name: 'when', location: 'libs/when', main: 'when' }
  ],
  paths: {
    chartjs: 'libs/chartjs/Chart',
    URI: 'libs/URIjs/src/URI',
    lodash: 'libs/lodash/lodash'
  }
});

