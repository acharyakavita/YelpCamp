const express=require('express')
const passport=require('passport')
const router=express.Router()
const User=require('../models/user');


router.get('/',function(req,res){
    res.render('landing')
})
//auth routes
//show register form

router.get('/register',function(req,res){
    res.render('register',{page: 'register'})
})

router.post('/register',function(req,res){
const newUser=new User({username:req.body.username})
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


module.exports=router;