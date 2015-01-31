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
    requirejs: {}
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-connect');
};
