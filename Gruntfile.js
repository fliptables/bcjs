module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true
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
        // will look for "Modernizr." and build a list of tests to include.
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

