var nconf = require('./lib/nconf').init();
var http = require('http');
var express = require('express');
var app = express();
var fm = require('file-manifest');
var routes = fm.generate('./routes');
var middleware = fm.generate('./lib/middleware');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');

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

// api
app.use('/member', routes.member);

// routes
app.use(routes.home);

// error handler
app.use(errorHandler());

var server = http.createServer(app);
var io = require('socket.io')(server);
server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function(socket) {
  socket.emit('check', { foo: 'bar', baz: 'quux', bool: true, num: 2, arr: [1, 2, 3] });
});
