require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require("bcrypt"); ///// Level 4 - bcrypt Hashing //////
// const saltRounds = 10;
// const md5 = require("md5"); ///// Level 3 - md5 Hashing //////
// const encrypt = require("mongoose-encryption"); ///// Level 2 - Encryption //////

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/newUserDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
// const secret = process.env.SECRET; ///// Level 2 - Encryption //////
// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]}) ///// Level 2 - Encryption //////

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//////////////////////////////// ROOT ROUTE /////////////////////////////////////
app.route("/")

.get(function(req, res){
  res.render("home");
})

//////////////////////////////// SECRETS ROUTE /////////////////////////////////////
app.route("/secrets")

.get(function(req, res){
    if(req.isAuthenticated()){
      res.render("secrets");
    }else{
      res.redirect("/login");
    }
});

//////////////////////////////// LOG-OUT ROUTE /////////////////////////////////////
app.route("/logout")

.get(function(req, res){
  req.logout();
  res.redirect("/");
});

//////////////////////////////// REGISTER ROUTE /////////////////////////////////////

app.route("/register")

.get(function(req, res){
  res.render("register");
})

.post(function(req, res){

  const email = req.body.username;
  const password = req.body.password;

  User.register({username: email}, password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});

//////////////////////////////// LOGIN ROUTE /////////////////////////////////////

app.route("/login")

.get(function(req, res){
  res.render("login");
})

.post(function(req, res){

  const username = req.body.username;
  const password = req.body.password;

  const user = new User({
    username: username,
    password: password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});




app.listen(3000, function(){
  console.log("Server started on port 3000");
});
