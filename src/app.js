require('dotenv').config();

const path = require('path');
const express = require("express");
const cookieParser = require('cookie-parser');
const { createHash } = require('crypto');
const { encryptSession, decryptSession } = require('./session');
const admin = require('./admin')

let users = require('./users');

// -- Express configuration

const app = express();

// Register ejs as .html. If we did
// not call this, we would need to
// name our views foo.ejs instead
// of foo.html.

app.engine('.html', require('ejs').__express);

// Without this you would need to
// supply the extension to res.render()
// ex: res.render('users.html').

app.set('view engine', 'html');

// Optional since express defaults to CWD/views

app.set('views', path.join(__dirname, 'views'));

// Path to our public directory

app.use(express.static(path.join(__dirname, 'public')));

// parses request cookies, populating
// req.cookies and req.signedCookies
// when the secret is passed

app.use(cookieParser());

// Process urlencoded form content.

app.use(express.urlencoded({ extended: false }))

// -- Express routes

app.get("/", (req, res) => {
  const currentUser = decryptSession(req.cookies.session);
  if (!currentUser) res.render('login', { msg: currentUser === null ? 'Session corrupted' : '' });
  else {
    res.render('users', { users, currentUser });
  }
});

app.post("/login", (req, res) => {
  const user = users.find(user => user.name === req.body.username);
  if (!user) res.render('login', { msg: 'user does not exist' });
  else {
    const hash = createHash('sha256').update(req.body.password).digest('hex');
    if (hash !== user.hash) res.render('login', { msg: 'invalid password' });
    else {
      res.cookie('session', encryptSession(user.name).toString())
      res.redirect("/")
    }
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie('session')
  res.redirect("/")
});

app.get("/:username", (req, res) => {
  const currentUser= decryptSession(req.cookies.session);
  const user = users.find(user => user.name === req.params.username);
  if (!currentUser) res.render('login', { msg: currentUser === null ? 'Session corrupted' : '' });
  else if (!user) res.render('error', { msg: 'user not found.'});
  else {
    res.render('profile', { user, currentUser });
  }
});

app.get("/:username/edit", (req, res) => {
  const currentUser= decryptSession(req.cookies.session);
  const user = users.find(user => user.name === req.params.username);
  if (!currentUser) res.render('login', { msg: currentUser === null ? 'Session corrupted' : '' });
  else if (currentUser !== user.name) res.render('error', { msg: `you are not allowed to edit ${user.name}'s profile.`});
  else if (!user) res.render('error', { msg: 'user not found.'});
  else {
    res.render('edit', { user });
  }
});

app.post("/:username/edit", (req, res) => {
  const currentUser= decryptSession(req.cookies.session);
  const user = users.find(user => user.name === req.params.username);
  if (!currentUser) res.status(401).send('unauthenticated');
  else if (currentUser !== user.name || currentUser === 'guest') res.status(403).send(`you are not allowed to edit ${user.name}'s profile.`);
  else if (!user) res.status(404).send('user not found.');
  else {
    users = users.map(u => u.name === user.name ? {...u, teaser: req.body.teaser, about: req.body.about} : u);
    res.redirect(`/${user.name}`);
  }
});

app.post("/:username/report", async (req, res) => {
  const currentUser= decryptSession(req.cookies.session);
  const user = users.find(user => user.name === req.params.username);
  if (!currentUser) res.status(401).send('unauthenticated')
  else if (!user) res.status(404).send('user not found.');
  else {
    const success = await admin.checkProfile(user.name);
    if (!success) res.sendStatus(500);
    else res.sendStatus(200);
  }
});

app.listen(process.env.PORT);
