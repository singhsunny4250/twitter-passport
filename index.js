const express = require('express');
const passport = require('passport');
const { Strategy } = require('@superfaceai/passport-twitter-oauth2');
const session = require('express-session');
require('dotenv').config();

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the Twitter OAuth2 strategy within Passport
passport.use(
  new Strategy(
    {
      clientID: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      clientType: 'confidential',
      callbackURL: `http://localhost:8080/auth/twitter/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('Success!', { accessToken, refreshToken });
      return done(null, profile);
    }
  )
);

const app = express();

app.use(passport.initialize());
app.use(
  session({ secret: 'keyboard cat', resave: false, saveUninitialized: true })
);

app.get(
  '/auth/twitter',
  passport.authenticate('twitter', {
    scope: ['tweet.read', 'users.read', 'offline.access'],
  })
);

app.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter'),
  function (req, res) {
    const userData = JSON.stringify(req.user, undefined, 2);
    res.end(
      `<h1>Authentication succeeded</h1> User data: <pre>${userData}</pre>`
    );
  }
);

app.listen(3000, () => {
  console.log(`Listening on PORT 3000`);
});