const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
let cookieSession = require('cookie-session');
app.use(cookieSession({name: 'session',
  keys: ['key1', 'key2']}));
const bcrypt = require('bcrypt');
const { findUserByEmail } = require('./helpers.js');
const { generateRandomString } = require('./helpers.js');
const { findURLByUser } = require('./helpers.js');
app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  sgq3y6: {longURL: "https://www.lighthouselabs.ca/", userID:"userRandomID"}
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//GET home page redirects to URLS or login depending on whether the user is logged in already
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

//GET Registration page
app.get("/register" , (req,res)=>{
  let user = users[req.session.user_id];
  let templateVars = {user};
  res.render('form_registration', templateVars);
});


//GET Login page
app.get("/login", (req,res)=>{
  let user = users[req.session.user_id];
  let templateVars = {user};
  res.render("form_login", templateVars);
});

//GET list of URLs
app.get("/urls", (req, res) => {
  let user = users[req.session.user_id];
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let userURL = findURLByUser(req.session.user_id, urlDatabase);
    let templateVars = { urls: userURL, 'user': user};
    res.render("urls_index", templateVars);
  }
});

//GET create new URL page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let user = users[req.session.user_id];
    let templateVars = {user: user};
    res.render("urls_new", templateVars);
  }
});

//GET page for specific short URL
app.get("/urls/:shortURL", (req, res) => {
  let correspondingUser = urlDatabase[req.params.shortURL]["userID"];
  if (req.session.user_id !== correspondingUser) {
    res.status(403);
    res.send("Error: You don't have permission to access this page");
  } else {
    let user = users[req.session.user_id];
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
    res.render("urls_show", templateVars);
  }
});

//GET short url link, redirect to the corresponding long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//POST method for creating a new URL
app.post("/urls", (req, res) => {
  let shortVersion = generateRandomString();
  let currentID = req.session.user_id;
  urlDatabase[shortVersion] = {longURL: req.body.longURL, userID: currentID};
  res.redirect(`/urls/${shortVersion}`);

});

//POST method for deleting an existing short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  let correspondingUser = urlDatabase[req.params["shortURL"]]['userID'];
  if (req.session.user_id !== correspondingUser) {
    res.status(403);
    res.send("Error: You don't have permission to access this operation");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

//POST method for editing an existing short URL
app.post("/urls/:id", (req, res) => {
  let correspondingUser = urlDatabase[req.params.id]["userID"];
  if (req.session.user_id !== correspondingUser) {
    res.status(403);
    res.send("Error: You don't have permission to access this operation");
  } else {
    let newUrl = req.body.newURL;
    let user = urlDatabase[req.params.id]["userID"];
    urlDatabase[req.params.id] = {longURL: newUrl, userID: user};
    res.redirect("/urls/");
  }
});

//POST method for logging in
app.post("/login", (req,res)=>{
  let user = findUserByEmail(req.body.email, users);
  if (!user) {
    res.status(403);
    res.send("Error: Cannot find an account for the email: " + req.body.email);
  } else {
    if (!bcrypt.compareSync(req.body.password,user.password)) {
      console.log(req.body.password);
      console.log(user.password);
      res.status(403);
      res.send("Error: Incorrect password");
    } else {
      req.session.user_id = user['id'];
      res.redirect("/urls/");
    }
  }
});

//POST method for logging out
app.post("/logout", (req,res)=>{
  req.session = null;
  res.redirect("/urls/");
});

//POST method for registering a new user
app.post("/register", (req, res) =>{
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("Error: email and/or password cannot be empty");
  } else if (findUserByEmail(req.body.email, users)) {
    res.status(400);
    res.send("Error: email already in use");
  } else {
    let newID = generateRandomString();
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password,10);
    users[newID] = {};
    users[newID]['id'] = newID;
    users[newID]['email'] = req.body.email;
    users[newID]['password'] = hashedPassword;
    req.session.user_id = newID;
    res.redirect("/urls/");
  }
  
});

//Launch server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});