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
    res.render('register')
})

router.post('/register',function(req,res){
const newUser=new User({username:req.body.username})
   User.register(newUser,req.body.password,function(err,user){
       if(err){
           console.log(err);
           return res.render('register')
       }
       else{
           passport.authenticate('local')(req,res,function(){
               res.redirect('/campgrounds')
           })
       }
   })//hash is stored
})

//login routes
router.get('/login',function(req,res){
    res.render('login')
})
//(route,middleware,callback)
router.post('/login',passport.authenticate('local',{
    //middleware
    successRedirect:'/campgrounds',
    failureRedirect:'/login'
    }),function(req,res){})


router.get('/logout',function(req,res){
    req.logout();
    res.redirect('/campgrounds')
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

module.exports=router;