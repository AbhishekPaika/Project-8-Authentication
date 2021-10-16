require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/newUserDB', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const secret = process.env.SECRET; 
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]})

const User = new mongoose.model("User", userSchema);

//////////////////////////////// ROOT ROUTE /////////////////////////////////////

app.route("/")

.get(function(req, res){
  res.render("home");
})

//////////////////////////////// REGISTER ROUTE /////////////////////////////////////

app.route("/register")

.get(function(req, res){
  res.render("register");
})

.post(function(req, res){

  const email = req.body.username;
  const password = req.body.password;

  const newUser = new User({
    email: email,
    password: password
  });
  newUser.save(function(err){
    if(!err){
      res.render("secrets")
    }else{
      res.render(err);
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

  User.findOne({email:username}, function(err, foundUser){

  if(foundUser){
    if(foundUser.password === password){
      res.render("secrets");
    }
  }else{
      res.render(err);
    }
  });
});








app.listen(3000, function(){
  console.log("Server started on port 3000");
});
