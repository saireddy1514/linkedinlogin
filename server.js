const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const routes = require('./routes.js');
const config = require('./config')
const User=require('./User')
const bodyParser= require('body-parser');
app.set('view engine', 'ejs');
const mongoose=require('mongoose');
const nodemailer = require('nodemailer');
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random()*charactersLength));
   }
   return result;
}

passport.use(new LinkedInStrategy({
  clientID: config.linkedinAuth.clientID,
  clientSecret: config.linkedinAuth.clientSecret,
  callbackURL: config.linkedinAuth.callbackURL,
  scope: ['r_emailaddress', 'r_liteprofile'],
}, function (token, tokenSecret, profile, done)
 {
   console.log(profile);

   User.findOne({id:profile.id})
       .then((person)=>{
           if(person)
           {
               console.log('User already exist')
           }
           else
           {
               console.log(profile.displayName);
               var rpassword = makeid(6)
               new User(
                   {
                       id:profile.id,
                       displayName: profile.displayName,
                       firstName:profile.name.givenName,
                       lastName:profile.name.familyName,
                       email:profile.emails[0].value,
                       password: rpassword
                   }).save()
                   .then((newUser)=>{console.log('User registred success'+newUser)
                     var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                             user: 'bussinesscarrier1991@gmail.com',
                             pass: 'gurrkinmharhfgjs'
                        }
                    });
                     var mailOptions = {
                       from: 'bussinesscarrier1991@gmail.com',
                       to: profile.emails[0].value,
                       subject: 'Thank You for Registering using Linkedin!!',
                       text: 'Your Password is :-'+rpassword
                    };
                     transporter.sendMail(mailOptions, function(error, info){
                       if (error) {
                         console.log(error);
                       } else {
                         console.log('Email sent: ' + info.response);
                       }
                     });
                 })
                   .catch((err)=>console.log(err))
           }
       })
       .catch(err=>console.log(err));



  return done(null, profile);
}
));

var db='mongodb://localhost:27017/linkedinlogin';
mongoose.connect(db,{useNewUrlParser: true})
.then(()=>{console.log('Mongo connected')})
.catch((err)=>console.log(err));


app.use(bodyParser.urlencoded({extended:true}));
app.post('/',function(req,res){
  var email=req.body.umail;
  var password = req.body.pswd;
  console.log(email+"-[--]"+password);
  User.findOne({email:email})
  .then((person)=>{
    if(person.password === password){
      res.render(__dirname+'/views/pages/profile',{'displayName':person.displayName,'id':person.id,'givenName':person.firstName,'familyName':person.lastName,'email':person.email,'remoteAddress': req.socket.remoteAddress,'localAddress':req.socket.localAddress});
    }
    else{
      res.send("LOGIN FAILED!!!");
    }
  })
  .catch(err=>console.log(err));
});

app.use('/', routes);

const port = 3000;

app.listen(port, () => {
  console.log('App listening on port ' + port);
});
