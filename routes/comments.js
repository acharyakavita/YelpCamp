const express=require('express')

const router=express.Router({mergeParams:true})// to pass req.params.id
const Campground=require('../models/campground');
const Comment=require('../models/comment');
// comments routes


//new comment
router.get('/new',isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err)
        }
        else{
            res.render('comments/new',{campground:campground})
        }
    })
    
})

//new comment post
router.post('/',isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        }
        else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    console.log(err)
                }
                else{
                    campground.comments.push(comment);
                    campground.save()
                    res.redirect('/campgrounds/'+campground._id)
                }
            })
        }
    })
    
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

module.exports=router;