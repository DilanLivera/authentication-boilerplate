const express = require("express");
const bodyParser = require("body-parser");
const sessions = require("client-sessions");
const csurf = require("csurf");

const app = express();
const PORT = process.env.PORT || 3000;

/*
  this is a mock user object for user object returned from the database
*/
const MOCK_USER = {
  _id: 1,
  username: "Dilan",
  password: "12345"
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  sessions({
    cookieName: "session",
    secret: "hello my name is? what? my name is?",
    duration: 30 * 60 * 1000, // how long the session will stay valid in ms
    cookie: {
      maxAge: 30 * 60 * 1000, // duration of the cookie in milliseconds, defaults to duration above
      ephemeral: false, // when true, cookie expires when the browser closes
      httpOnly: true, // when true, cookie is not accessible from javascript
      secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
    }
  })
);
app.use(csurf());
app.use(express.static(__dirname + "/public"));

// home
app.get("/", (req, res) => {
  res.render("index");
});

// register
app.get("/register", (req, res) => {
  res.render("register", { csrfToken: req.csrfToken() });
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // here save the user details in the database

  // set the id of the user to the cookie
  req.session.userId = MOCK_USER._id;

  // redirect the user
  res.redirect("secret-content");
});

// login
app.get("/login", (req, res) => {
  res.render("login", { csrfToken: req.csrfToken() });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  /* 
    find the user in the database
    check if found user's password match the password current user password
      if it doesnt return to login page and show error incorrect email / password
      if it match redirect user to the secret page
  */
  if (username !== MOCK_USER.username || password !== MOCK_USER.password)
    return res.render("login", { error: "incorrect email / password", csrfToken: req.csrfToken() });

  // set the id of the user to the cookie
  req.session.userId = MOCK_USER._id;

  res.redirect("/secret-content");
});

// logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// secret content
app.get("/secret-content", (req, res) => {
  // check if there is a session and if there is a user id in the session
  if (!(req.session && req.session.userId)) return res.redirect("/login");

  /*
    find the user from the database
      if user doesnt exist redirect user to the login page 
  */

  if (req.session.userId !== MOCK_USER._id) return res.redirect("/login");

  res.locals.user = MOCK_USER;
  res.render("secret-content");
});

app.listen(PORT, () => console.log("Now Serving - Authentication Boilerplate"));
