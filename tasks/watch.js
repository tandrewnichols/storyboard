module.exports = {
  less: {
    files: ['app/css/**/*.less'],
    tasks: ['less:dev']
  },
  server: {
    files: ['app.js', 'routes/**/*.js', 'lib/**/*.js', 'models/**/*.js', 'config/**/*.json', 'views/**/*.jade'],
    tasks: ['server'],
    options: {
      spawn: false
    }
  },
  tasks: {
    files: ['tasks/**/*.js'],
    tasks: ['clean', 'copy:dev', 'ngtemplates:dev', 'concat_sourcemap:dev', 'ngAnnotate:dev', 'less:dev', 'server'],
    options: {
      spawn: false
    }
  },
  js: {
    files: ['app/js/**/*.js'],
    tasks: ['ngtemplates:dev', 'concat_sourcemap:dev', 'ngAnnotate:dev']
  },
  jade: {
    files: ['app/templates/**/*.jade'],
    tasks: ['jade:dev', 'ngtemplates:dev', 'concat_sourcemap:dev', 'ngAnnotate:dev']
  }
};
