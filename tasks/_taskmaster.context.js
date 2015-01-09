var path = require('path');
var root = path.resolve(__dirname, '..');

module.exports = {
  files: {
    js: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/jquery.cookie/jquery.cookie.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',
      'bower_components/lodash/dist/lodash.js',
      'node_modules/safe-obj/dist/safe.js',
      'node_modules/underscore.string/lib/underscore.string.js',
      'bower_components/angular-lodash/angular-lodash.js',
      'vendor/js/**/*.js',
      'app/js/app.js',
      'app/js/**/*.js',
      '!app/js/bootstrap.js'
    ]
  },
  paths: {
    root: root,
    bower: root + '/bower_components',
    generated: root + '/generated',
    'public': root + '/public',
    views: root + '/views',
    tasks: root + '/tasks',
    vendor: root + '/vendor',
    node: root + '/node_modules',
    app: root + '/app'
  }
};
