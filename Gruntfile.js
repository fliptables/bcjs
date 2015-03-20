module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        'asi': false,
        'bitwise': false,
        'boss': false,
        'browser': true,
        'camelcase': true,
        'couch': false,
        'curly': true,
        'debug': false,
        'devel': true,
        'dojo': false,
        'eqeqeq': true,
        'eqnull': true,
        'es3': true,
        'esnext': false,
        'evil': false,
        'expr': true,
        'forin': false,
        'funcscope': true,
        'gcl': false,
        'globalstrict': false,
        'immed': true,
        'iterator': false,
        'jquery': false,
        'lastsemic': false,
        'latedef': false,
        'laxbreak': true,
        'laxcomma': false,
        'loopfunc': true,
        'mootools': false,
        'moz': false,
        'multistr': false,
        'newcap': true,
        'noarg': true,
        'node': false,
        'noempty': false,
        'nonew': true,
        'nonstandard': false,
        'nomen': false,
        'onecase': false,
        'onevar': false,
        'passfail': false,
        'phantom': false,
        'plusplus': false,
        'proto': false,
        'prototypejs': false,
        'regexdash': true,
        'regexp': false,
        'rhino': false,
        'scripturl': true,
        'shadow': false,
        'shelljs': false,
        'smarttabs': true,
        'strict': false,
        'sub': false,
        'supernew': false,
        'trailing': true,
        'undef': true,
        'unused': true,
        'validthis': true,
        'withstmt': false,
        'white': true,
        'worker': false,
        'wsh': false,
        'yui': false,
        'maxlen': 120,
        'indent': 4,
        'maxerr': 250,
        'globals': {
          'JSON': true
        },
        'predef': ['define', 'module', 'JSON'],
        'quotmark': 'single',
        'maxcomplexity': 10
      },
      client: {
        src: [
          'src/**/*.js',
          '!src/libs/**/*.js'
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: 5000,
          debug: true,
          keepalive: true
        }
      }
    },
    modernizr: {
      dist: {
        devFile: 'src/libs/modernizr/modernizr.js',
        outputFile: 'dist/libs/modernizr/modernizr.js',
        // will look for 'Modernizr.' and build a list of tests to include.
        parseFiles: true,
        files: {
          src: [
            'src/**/*.js',
            '!src/libs/**/*.js'
          ]
        }

      }
    },
    requirejs: {
      dist: {
        options: {
          baseUrl: 'src/',
          // Use the development configuration and override with production
          // settings.
          mainConfigFile: [
            'src/config.js',
            'src/prodConfig.js'
          ],
          // the name of the AMD loader we want to use.
          name: 'almond',
          include: [
            'BetterContext'
          ],
          out: 'dist/BetterContext.js',
          insertRequire: ['BetterContext'],
          optimize: 'none',
          wrap: true,
          generateSourceMaps: false,
          preserveLicenseComments: true
        }
      }
    },
    uglify: {
      options: {},
      dist: {
        files: {
          'dist/BetterContext.min.js': 'dist/BetterContext.js'
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-modernizr');

  grunt.registerTask('build', [
    'jshint:client',
    'modernizr:dist',
    'requirejs:dist',
    'uglify:dist'
  ]);

};

