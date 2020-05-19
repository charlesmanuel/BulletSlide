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
var userSchema = new Schema({
    userID: String,
    first: String,
    last: String,
    email: String,
    password: String
});
var User = mongoose.model("User", userSchema);

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

app.get('/examplelibrary', function(req, res){
    res.render('examplelibrary');
});

app.get('/signup', function(req, res){
    res.render('signup');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        console.log("user logged out.")
    });
    res.redirect('/login');
});


function checkSignIn(req, res, next){
    if(req.session.user){
        next();     //If session exists, proceed to page
    } 
    else {
        var err = new Error("Not logged in!");
        console.log(req.session.user);
        next(err);  //Error, trying to access unauthorized page!
    }
}

app.get('/users/:userID/documents', function(req, res){
    var userID = req.params.userID;
    var userposts = Posts.filter(post => post.user == userID);
    var isEmpty = "true";
    if (userposts.length){
        isEmpty = "false";
    }
    var newID = getRandomInt().toString();
    res.render('documents', {userID: userID, posts: userposts, empty: isEmpty, newID: newID});
});

app.post('/signup', function(req, res){
    console.log(req.body);
    if(!req.body.inputLast || !req.body.inputFirst || !req.body.inputEmail || !req.body.inputPassword){
        res.render('signup', {message: "Please fill out all fields"});
    } 
    else {
        var thisuserID = getRandomInt();
        var newUser = new User({
            userID: thisuserID,
            first: req.body.inputFirst,
            last: req.body.inputLast,
            email: req.body.inputEmail,
            password: req.body.inputPassword
        });
        newUser.save(function(err, User){
            if(err)
                res.render('signup', {message: "Database error"});
            else
                req.session.user = newUser;
                var newID = getRandomInt().toString();
                var userID = thisuserID.toString();
                res.redirect('/users/' + userID + '/documents/' + newID + '/editor');
        });

        /* var thisuserID = getRandomInt();
        var newUser = {userID: thisuserID, first: req.body.inputFirst, last: req.body.inputLast, email: req.body.inputEmail, password: req.body.inputPassword};
        Users.push(newUser);
        req.session.user = newUser;
        var newID = getRandomInt().toString();
        var userID = thisuserID.toString();
        res.redirect('/users/' + userID + '/documents/' + newID + '/editor'); */
    }
});

app.post('/login', function(req, res){
    if(!req.body.inputEmail || !req.body.inputPassword){
        res.render('login', {message: "Please enter both id and password"});
    } 
    else {
        User.findOne({email: req.body.inputEmail, password: req.body.inputPassword}, "userID", function(err, response){
            if(!response) {
                res.render('login', {message: "incorrect username or password"});
                return;
            }
            else {
                var theuser = response.userID;
                var theurl = '/users/' + theuser + '/documents/';
                res.redirect(theurl);
                return;
            }
        });
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
    var docID = req.params.documentid;
    var userID = req.params.userID;
    var found = Posts.find(element => element.postID == docID && element.user == userID);
    if (found && found.content.listitems != undefined) {
        var posttitle = found.content.title;
        var postauthor = found.content.author;
        var postbullets = found.content.listitems;
        res.render('editor', {found: "true", bulletsEmpty: "false", title: posttitle, author: postauthor, bullets: postbullets});
    }
    else if (found && found.content.listitems == undefined){
        var posttitle = found.content.title;
        var postauthor = found.content.author;
        res.render('editor', {found: "true", bulletsEmpty: "true", title: posttitle, author: postauthor});
    }
    else {
        res.render('editor', {found: "false"});
    }
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
    var found = Posts.find(element => element.postID == docID && element.user == userID);
    if (found) {
        var index = Posts.indexOf(found);
        if (index > -1){
            Posts.splice(index, 1);
        }
    }
    Posts.push(newpost);
    console.log(Posts);
    console.log(newpost.content);
});


app.get('/users/:userID/documents/:documentid/preview', function(req, res){
    var postID = req.params.documentid;
    var userID = req.params.userID;
    const found = Posts.find(element => element.postID == postID);
    if (found != undefined && found.content.listitems != undefined) {
        var posttitle = found.content.title;
        var postauthor = found.content.author;
        var postbullets = found.content.listitems;
        res.render('preview', {title: posttitle, author: postauthor, bullets: postbullets, isEmpty: "false", bulletsEmpty: "false"});
    }
    else if(found != undefined && found.content.listitems == undefined){
        var posttitle = found.content.title;
        var postauthor = found.content.author;
        res.render('preview', {title: posttitle, author: postauthor, isEmpty: "false", bulletsEmpty: "true"})
    }
    else {
        res.render('preview', {isEmpty: "true", bulletsEmpty: "true"});
    }
});



app.listen(PORT, () => console.log(`server running on port ${PORT}`));
