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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/my_db');
var Crypto = require('crypto-js');


var Schema = mongoose.Schema;
var userSchema = new Schema({
    userID: String,
    first: String,
    last: String,
    email: String,
    password: String
});


var postSchema = new Schema({
    postID: String,
    user: String,
    shared: {type: Boolean, default: false},
    content: {
        title: String,
        author: String,
        listitems: Object
    }
});

var User = mongoose.model("User", userSchema);
var Post = mongoose.model("Post", postSchema);


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
var randoms = [];
app.use(session({secret: "le epic secret"}));
//session
// End setup


function getRandomInt() {
    return Math.floor(Math.random() * Math.floor(100000000));
}

function isSignedIn(inputuser){
    if (inputuser == undefined){
        return 0;
    }
    else {
        return inputuser.userID;
    }
}


//Begin handling routes
app.get('/', function(req, res){
    res.render('index', {isSigned: isSignedIn(req.session.user)});
});

app.get('/examplelibrary', function(req, res){
    res.render('examplelibrary', {isSigned: isSignedIn(req.session.user)});
});

app.get('/signup', function(req, res){
    res.render('signup');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/logout', function(req, res){
    req.session.destroy(function(){
        //console.log("user logged out.")
    });
    res.redirect('/login');
});

app.get('/example1', function(req, res){
    res.render('example1', {isSigned: isSignedIn(req.session.user)});
});

app.get('/example2', function(req, res){
    res.render('example2', {isSigned: isSignedIn(req.session.user)});
});

app.get('/example3', function(req, res){
    res.render('example3', {isSigned: isSignedIn(req.session.user)});
});


/* function checkSignIn(req, res, next){
    if(req.session.user.userID == req.params.userID){
        next();     //If session exists, proceed to page
    }
    else {
        res.status(403);
        res.render("forbidden");
        return;
    }
} */



app.get('/users/:userID/documents', function(req, res){
    var userID = req.params.userID;
    if (!req.session.user || (req.session.user.userID != userID)){
        res.status(403);
        res.render("forbidden");
        return;
    }
    Post.find({user: userID}, function(err, response){
        var userposts = response;
        var isEmpty = "true";
        if (userposts.length){
            isEmpty = "false";
        }
        var newID = getRandomInt().toString();
        res.render('documents', {userID: userID, posts: userposts, empty: isEmpty, newID: newID});
    });
});

app.post('/signup', function(req, res){
    var regex = /[A-Z0-9]/;
    //console.log(req.body);
    if(!req.body.inputLast || !req.body.inputFirst || !req.body.inputEmail || !req.body.inputPassword){
        res.render('signup', {message: "Please fill out all fields"});
    }
    else if (req.body.inputPassword.length < 8 || !regex.test(req.body.inputPassword)){
        res.render('signup', {message: "password must be at least 8 characters, contain an uppercase and a number"});
    }
    else {
        User.findOne({"email": req.body.inputEmail}, function(err, response){
            if (err){
                res.render('signup', {message: "This account already exists!"});
                return;
            }
            if(!response){
                var thisuserID = getRandomInt();
                var unhashed = req.body.inputPassword.toString();
                var hashed = Crypto.SHA256(unhashed).toString();
                var newUser = new User({
                    userID: thisuserID,
                    first: req.body.inputFirst,
                    last: req.body.inputLast,
                    email: req.body.inputEmail,
                    password: hashed
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
            }
            else{
                res.render('signup', {message: "This account already exists!"});
            }

        });
    }
});

app.post('/login', function(req, res){
    if(!req.body.inputEmail || !req.body.inputPassword){
        res.render('login', {message: "Please enter both id and password"});
    } 
    else {
        var unhashed = req.body.inputPassword.toString();
        var hashed = Crypto.SHA256(unhashed).toString();
        User.findOne({email: req.body.inputEmail, password: hashed}, "userID", function(err, response){
            if(!response) {
                res.render('login', {message: "incorrect username or password"});
                return;
            }
            else {
                req.session.user = response;
                var theuser = response.userID;
                var theurl = '/users/' + theuser + '/documents/';
                res.redirect(theurl);
                return;
            }
        });
    }
});


app.get('/users/:userID/documents/:documentid/editor', function(req, res){
    var docID = req.params.documentid;
    var userID = req.params.userID;

    if (!req.session.user || (req.session.user.userID != userID)){
        res.status(403);
        res.render("forbidden");
        return;
    }

    Post.findOne({postID: docID, user: userID}, function(err, response){
        var found = response;
        if (found && found.content.listitems != null) {
            var posttitle = found.content.title;
            var postauthor = found.content.author;
            var postbullets = found.content.listitems;
            res.render('editor', {found: "true", bulletsEmpty: "false", title: posttitle, author: postauthor, bullets: postbullets});
        }
        else if (found && found.content.listitems == null){
            var posttitle = found.content.title;
            var postauthor = found.content.author;
            res.render('editor', {found: "true", bulletsEmpty: "true", title: posttitle, author: postauthor});
        }
        else {
            res.render('editor', {found: "false"});
        }
    });
});

app.post('/users/:userID/documents/:documentid/editor/save', function(req, res){
    var docID = req.params.documentid;
    //console.log(docID);
    var userID = req.params.userID;
    //console.log(userID);
    var postcontent = req.body;
    var intitle = req.body.title;
    var inauthor = req.body.author;
    var inlist = req.body.listitems;
    var newpost = new Post({
        postID: docID,
        userID: userID,
        content: {
            title: intitle,
            author: inauthor,
            listitems: inlist
        }
    });
    Post.updateOne(
        {user: userID, postID: docID},
        {$set: {content: {title: intitle, author: inauthor, listitems: inlist}}},
        {upsert: true},
        function(err, Post){
    });
});


app.get('/users/:userID/documents/:documentid/preview', function(req, res){
    var postID = req.params.documentid;
    var userID = req.params.userID;
    var isOwner = true;
    if (!req.session.user || (req.session.user.userID != userID)){
        isOwner = false;
        //console.log("isOwner is false for this page");
    }
    Post.findOne({postID: postID, user: userID}, function(err, response){
        var found = response;
        if ((!req.session.user || (req.session.user.userID != userID)) && (!found.shared)){
            res.status(403);
            res.render("forbidden");
            return;
        }
        else if (found != null && found.content.listitems != null) {
            var posttitle = found.content.title;
            var postauthor = found.content.author;
            var postbullets = found.content.listitems;
            res.render('preview', {title: posttitle, author: postauthor, bullets: postbullets, isEmpty: "false", bulletsEmpty: "false", owner: isOwner});
        }
        else if(found != null && found.content.listitems == null){
            var posttitle = found.content.title;
            var postauthor = found.content.author;
            res.render('preview', {title: posttitle, author: postauthor, isEmpty: "false", bulletsEmpty: "true", owner: isOwner})
        }
        else if (found == null){
            res.status(404).render("404");
        }
        else {
            res.render('preview', {isEmpty: "true", bulletsEmpty: "true", owner: isOwner});
        }
    });
});

app.post('/users/:userID/documents/:documentid/share', function(req, res){
    var docID = req.params.documentid;
    var userID = req.params.userID;
    //console.log("share post successfully clicked");
    Post.updateOne(
        {user: userID, postID: docID},
        {$set: {shared: true}},
        function(err, Post){

        }
    );
});


app.get('*', (req, res) => {
    res.status(404);
    res.render("404");
});



app.listen(PORT, () => console.log(`server running on port ${PORT}`));
