const passport = require('passport');
const express = require('express');
const requestIp = require('request-ip');
var router = express.Router();

router.get('/', function (req, res) {
  res.render('pages/index.ejs');
});

router.get('/profile', isLoggedIn, function (req, res) {
  console.log(req.socket.remoteAddress)
  console.log(req.socket.localAddress)
  res.render('pages/profile.ejs', {
    user: req.user,
    displayName:req.user.displayName,
    id:req.user.id,
    givenName:req.user.name.givenName,
    familyName:req.user.name.familyName,
    email:req.user.emails[0].value,
    remoteAddress: req.socket.remoteAddress,
    localAddress:req.socket.localAddress
  });
});

router.get('/auth/linkedin', passport.authenticate('linkedin', {
  scope: ['r_emailaddress', 'r_liteprofile'],
}));

router.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', {
    successRedirect: '/profile',
    failureRedirect: '/login'
  }));

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

module.exports = router;
