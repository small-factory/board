var express  = require('express');
const fileUpload = require('express-fileupload');
var app      = express();
const uuidv1 = require('uuid/v1');
app.use(fileUpload());
const csvtojsonV2=require("csvtojson/v2");
const request=require("request");
var port     = process.env.PORT || 3000;
const path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
const fs                = require('fs');
const https             = require('https');
const mysql             = require('mysql');
const cors              = require('cors');



app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-type, Accept");
    next();
})

app.use(express.static('public'))

mongoose.connect('mongodb://three:four44@ds251548.mlab.com:51548/hexboard',{useMongoClient: true});
require('./config/passport')(passport); // pass passport for configuration



app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating



app.use(session({
    secret: 'weneedtocomeupwithsometypeofpasscode', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port);
console.log('The magic happens on port ' + port);
