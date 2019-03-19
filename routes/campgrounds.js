const express=require('express')
const router=express.Router()
const Campground=require('../models/campground');

//campgrounds
router.get('/',function(req,res){
    Campground.find({},function(err,allCamps){
        if(err){
            console.log(err)
        }
        else
        {
            res.render('campgrounds/index',{campground:allCamps})
        }
    })
    
})

//post new campground
router.post('/',isLoggedIn,function(req,res){
    let newCampground=new Object();
    newCampground.name= req.body.name
    newCampground.image=req.body.url
    newCampground.description=req.body.description
    Campground.create(newCampground,function(err,newCamp){
        if(err){
            console.log(err)
        }
        else
        {
            res.redirect('/campgrounds')
    }
    })
    
})

//add new campground
router.get('/new',isLoggedIn,function(req,res){
    res.render('campgrounds/new')
})


//more info about campground
router.get('/:id',function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCamp){
        if(err){
            console.log(err)
        }
        else{
            res.render('campgrounds/show',{campground:foundCamp})
        }
    });
})


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
module.exports=router;