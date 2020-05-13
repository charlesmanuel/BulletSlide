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
mongoose.connect('mongodb://localhost/my_db');


var Schema = mongoose.Schema;
var postSchema = new Schema({
    
});

class Point {
    type = "text";
    content = "";
    hasSubpoint = false;
    hasSubimg = false;
    hasLink = false;
    linktext = "";
    subpts = [];

    constructor(textfield) {
      this.content = $(textfield).val();

      if ($(textfield).hasClass("imgiconadded")){
        this.hasSubimg = true;
      }
      if ($(textfield).hasClass("texticonadded")){
        this.hasSubpoint = true;
      }
      if ($(textfield).hasClass("linkiconadded")){
        this.hasLink = true;
        var linkvar = $(textfield).next();
        var linkvartext = $(linkvar).attr("href");
        this.linktext = linkvartext;
      }
    }
}

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
app.use('/users/:userID/documents/:documentid/', express.static('public'));
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
         //generate first post ID
        var thisuserID = getRandomInt();
        var newUser = {userID: thisuserID, first: req.body.inputFirst, last: req.body.inputLast, email: req.body.inputEmail, password: req.body.inputPassword};
        Users.push(newUser);
        req.session.user = newUser;
        var newID = getRandomInt().toString();
        var userID = thisuserID.toString();
        res.redirect('/users/' + userID + '/documents/' + newID + '/editor');
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

app.get('/users/:userID/documents/:documentid/editor', function(req, res){
    res.render('editor');
});

app.post('/users/:userID/documents/:documentid/editor/save', function(req, res){
    var docID = req.params.documentid;
    console.log(docID);
    var userID = req.params.userID;
    console.log(userID);
    var user = req.session.user.email;
    console.log(user);
    var postcontent = req.body;
    var newpost = {user: userID, postID: docID, content: postcontent};
    console.log(newpost);
    console.log(newpost.content.listitems);
    Posts.push(newpost);
    //console.log(Posts);
});


app.get('/users/:userID/documents/:documentid/preview', function(req, res){
    var postID = req.params.documentid;
    var userID = req.params.userID;
    const found = Posts.find(element => element.postID == postID);
    var posttitle = found.content.title;
    var postauthor = found.content.author;
    var postbullets = found.content.listitems;


    res.render('preview', {title: posttitle, author: postauthor, bullets: postbullets, thispostID: postID});
});



app.listen(PORT, () => console.log(`server running on port ${PORT}`));
