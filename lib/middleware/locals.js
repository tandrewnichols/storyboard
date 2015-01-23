var extend = require('config-extend');
var nconf = require('nconf');

module.exports = function(req, res, next) {
  extend(res.locals, {
    pageComponents: {},
    isDev: nconf.get('NODE_ENV') === 'development',
    url: req.originalUrl
  });
  next();
};
