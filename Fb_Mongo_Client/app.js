var express = require('express')
  , routes = require('./routes')
  , http = require('http')
 // ,login1 = require('./routes/Login')
  , login1 = require('./routes/home')
  , path = require('path');

var app = express();


//URL for the sessions collections in mongoDB
var mongoSessionConnectURL = "mongodb://localhost:27017/sessions";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo")(expressSession);
var mongo = require("./routes/mongo");
//var login = require("./routes/login");

app.use(expressSession({
	secret: 'cmpe273_teststring',
	resave: false,  //don't save session if unmodified
	saveUninitialized: false,	// don't create session until something stored
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,
	store: new mongoStore({
		url: mongoSessionConnectURL
	})
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/', login1.loginCheck);
app.get('/index', routes.index);
app.post('/index', login1.loginCheck);
app.get('/home',login1.homepage);
app.post('/home',login1.homepage);
app.get('/loadpage', login1.loadpage);
app.post('/signup', login1.signup);
app.post('/addgroup',login1.addgroup);
app.get('/group', login1.group);
app.get('/loadgroup', login1.loadgroup);
app.post('/loadgroup', login1.loadgroup);
app.post('/loadgroup1', login1.loadgroup1);
app.post('/addmember', login1.addgrpmember);
app.post('/delmember', login1.delgrpmember);
app.get('/delgroup',login1.delgroup);
app.get('/profile', login1.profile);
app.get('/loadprofile', login1.loadprofile);
app.post('/addfriend', login1.addfriend);
app.get('/showfriend',login1.showfriend);
app.post('/accept', login1.accept);
app.post('/decline', login1.decline);
app.post('/postfeed', login1.postfeed);
app.get('/signout', login1.logout);
//app.get('/shows', login1.shows);
app.post('/savechanges',login1.savechanges);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
