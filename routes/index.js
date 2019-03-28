const express=require('express')
const passport=require('passport')
const router=express.Router()
const User=require('../models/user');
const Campground=require('../models/campground');
const Notification=require('../models/notification');
const async=require('async');
var nodemailer=require('nodemailer');
var crypto=require('crypto');
var middleware=require('../middleware/index')

router.get('/',function(req,res){
  console.log('hello')
    res.render('landing')
})
//auth routes
//show register form

router.get('/register',function(req,res){
    res.render('register',{page: 'register'})
})

router.post('/register',function(req,res){
const newUser=new User({username:req.body.username,firstName:req.body.firstName,lastName:req.body.lastName,
  email:req.body.email,avatar:req.body.avatar,aboutMe:req.body.aboutMe})
if(req.body.adminCode === 'secretcode123') {
    newUser.isAdmin = true;
  }
   User.register(newUser,req.body.password,function(err,user){
       if(err){
           console.log(err);
           return res.render('register',{error:err.message})
       }
       else{
           passport.authenticate('local')(req,res,function(){
            req.flash('success','Welcome to yelpCamp' + user.username)
               res.redirect('/campgrounds')
           })
       }
   })//hash is stored
})

//login routes
router.get('/login',function(req,res){
    res.render('login',{page: 'login'})
})
//(route,middleware,callback)
router.post('/login',passport.authenticate('local',{
    //middleware
    successRedirect:'/campgrounds',
    failureRedirect:'/login',
    failureFlash:"Sorry! You couldn't login",
    successFlash: "Login, successful"
    }),function(req,res){})


router.get('/logout',function(req,res){
    req.logout();
    req.flash('success','Logged you out')
    res.redirect('/campgrounds')
})

//profile
router.get('/users/:id',async function(req,res){
  try{
    let user = await User.findById(req.params.id).populate('followers').exec();
    try{
      let campgrounds = await Campground.find().where('author.id').equals(user._id).exec()
      res.render('users/show',{user:user,campgrounds:campgrounds})
    }
    catch(err){
      req.flash('error', err.message);
      return res.redirect('back');
    }
  }
  catch(err){
    req.flash('error', err.message);
    return res.redirect('back');
  }
})


//reset password routes
// forgot password
router.get('/forgot', function(req, res) {
    res.render('forgot');
  });
  
  router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email,username:req.body.username }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'kavi120391@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'kavi120391@gmail.com',
          subject: 'Yelp Camp Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'kavi120391@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'kavi120391@mail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/campgrounds');
    });
  });

  // follow user
router.get('/follow/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);
    user.followers.push(req.user._id);
    user.save();
    req.flash('success', 'Successfully followed ' + user.username + '!');
    res.redirect('/users/' + req.params.id);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications', middleware.isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } }
    }).exec();
    let allNotifications = user.notifications;
    res.render('notifications/index', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id', middleware.isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/campgrounds/${notification.campgroundId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
}); 
module.exports=router;