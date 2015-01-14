var nconf = require('./lib/nconf').init();
var _ = require('./lib/lodash');
var http = require('http');
var express = require('express');
var app = express();
var fm = require('file-manifest');
var middleware = fm.generate('./lib/middleware');
express.Router.middleware = middleware;
var routes = fm.generate('./routes');
var models = fm.generate('./models');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var bodyParser = require('body-parser');
var expressive = require('expressive');

expressive(app, { envs: ['development'], alias: { development: 'dev'} }, nconf.get('NODE_ENV') || 'development');

app.set('port', nconf.get('PORT'));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set('layout', 'layout');

app.use(compress());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/assets', express.static(__dirname + '/' + nconf.get('staticFilePath')));

// common middleware
app.use(middleware.locals);
app.use(middleware.neo4j);
app.use(middleware.extendRes);
app.use(middleware.author);
app.use('/api', middleware.ajax);

// api
app.dev.use('/api/admin', middleware.requireMember, routes.admin);
app.use('/api/author', routes.author);
app.use('/api/world', middleware.requireMember, routes.world);
app.use('/api/story', middleware.requireMember, routes.story);

// routes
app.use(routes.home);

// error handler
app.use(routes.error);

var server = http.createServer(app);
var io = require('socket.io')(server);
server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function(socket) {
  socket.emit('check', { foo: 'bar', baz: 'quux', bool: true, num: 2, arr: [1, 2, 3] });
});

process.on('uncaughtException', function(err) {
  console.log(err);
  console.log(err.stack);
});
