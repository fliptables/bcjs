require.config({
  baseUrl: '../src',
  deps: ['BetterContext'],
  packages: [
    { name: 'when', location: 'libs/when', main: 'when' }
  ],
  paths: {
    Chart: 'libs/chartjs/Chart',
    URIjs: 'libs/URIjs/src',
    lodash: 'libs/lodash/lodash'
  }
});

