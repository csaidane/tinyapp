const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const generateRandomString = function() {
  let random = Math.random().toString(36).substring(7);
  return random;
};

const findUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register" , (req,res)=>{
  let user = users[req.cookies["user_id"]];
  let templateVars = {user};
  res.render('form_registration', templateVars);
});


app.get("/login", (req,res)=>{
  let user = users[req.cookies["user_id"]];
  let templateVars = {user};
  res.render("form_login", templateVars);
});

app.get("/urls", (req, res) => {
  let user = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, 'user': user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let user = users[req.cookies["user_id"]];
  let templateVars = {user: user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let user = users[req.cookies["user_id"]];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortVersion = generateRandomString();
  urlDatabase[shortVersion] = req.body.longURL;
  res.redirect(`/urls/${shortVersion}`);         // Respond with 'Ok' (we will replace this)

});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  let newUrl = req.body.newURL;
  urlDatabase[req.params.id] = newUrl;
  res.redirect("/urls/");
});


app.post("/login", (req,res)=>{
  let user = findUserByEmail(req.body.email);
  if (!user) {
    res.status(403);
    res.send("Error: Cannot find an account for the email: " + req.body.email);
  } else {
    if (user.password !== req.body.password) {
      res.status(403);
      res.send("Error: Incorrect password");
    } else {
      res.cookie("user_id", user['id']);
      res.redirect("/urls/");
    }
  }
});

app.post("/logout", (req,res)=>{
  res.clearCookie("user_id");
  res.redirect("/urls/");
});

app.post("/register", (req, res) =>{
  if (req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send("Error: email and/or password cannot be empty");
  } else if (findUserByEmail(req.body.email)) {
    res.status(400);
    res.send("Error: email already in use");
  } else {
    let newID = generateRandomString();
    users[newID] = {};
    users[newID]['id'] = newID;
    users[newID]['email'] = req.body.email;
    users[newID]['password'] = req.body.password;
    res.cookie("user_id",newID);
    console.log(users);
    res.redirect("/urls/");
  }
  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});