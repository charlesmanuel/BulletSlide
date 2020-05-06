var express = require('express');
var multer = require('multer');
var app = express();
var path = require('path');
const fs = require('fs');
var bodyParser = require('body-parser');
var upload = multer();
var mongoose = require('mongoose');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const uuid = require('uuid');


//Setup
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
// parsing
app.use(bodyParser.json()); 
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));
app.set('view engine', 'pug');
app.set('views', './views');
var Users = [];
var Posts = [];
app.use(session({secret: "le epic secret"}));
//session
app.use(session({secret: "Your secret key"}));
// End setup


function getRandomInt() {
    return Math.floor(Math.random() * Math.floor(100000000));
}

//Begin handling routes
app.get('/', function(req, res){
    res.render('index');
});

app.get('/signup', function(req, res){
    res.render('signup');
});

app.post('/signup', function(req, res){
    console.log(req.body);
    if(!req.body.inputLast || !req.body.inputFirst || !req.body.inputEmail || !req.body.inputPassword){
        res.render('signup', {message: "Please fill out all fields"});
    } 
    else {
        Users.filter(function(user){
            if(user.inputEmail === req.body.inputEmail){
                res.render('signup', {
                message: "Account with this email address already exists! Login or choose another email"});
            }
        });
        var newUser = {first: req.body.inputFirst, last: req.body.inputLast, email: req.body.inputEmail, password: req.body.inputPassword};
        Users.push(newUser);
        req.session.user = newUser;
        res.redirect('/editor');
        console.log(Users);
    }
});


function checkSignIn(req, res){
    if(req.session.user){
       next();     //If session exists, proceed to page
    } else {
       var err = new Error("Not logged in!");
       console.log(req.session.user);
       next(err);  //Error, trying to access unauthorized page!
    }
}

app.get('/editor', function(req, res){
    res.render('editor');
});

app.post('/editor', function(req, res){
    var newID = getRandomInt();
    var user = req.session.user.email;
    var postcontent = req.body;
    var newpost = {username: user, postID: newID, content: req.body};
    console.log(newpost);
    Posts.push(newpost);
    console.log(Posts);
    res.redirect('/preview');
});

app.get('/preview', function(req, res){
    console.log("received data:");
    res.render('preview');
});



app.listen(PORT, () => console.log(`server running on port ${PORT}`));
