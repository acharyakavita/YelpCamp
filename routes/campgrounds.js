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
    let author={}
    newCampground.name= req.body.name
    newCampground.image=req.body.url
    newCampground.description=req.body.description
    author.id=req.user._id
    author.username=req.user.username
    newCampground.author=author;
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


//edit and update
router.get('/:id/edit',checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,foundCamp){
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        }
        else{
            res.render('campgrounds/edit',{campground:foundCamp})
        }
    })
    
})

router.put('/:id',function(req,res){
    let data={name:req.body.name,image:req.body.url,description:req.body.description}
    Campground.findByIdAndUpdate(req.params.id,data,function(err,updatedCamp){
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        }
        else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
    
})

//destroy
router.delete('/:id',checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        }
        else{
            res.redirect("/campgrounds");
        }
    })
    
})

function checkCampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
module.exports=router;