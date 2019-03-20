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
                    comment.author.id=req.user._id
                    comment.author.username=req.user.username
                    comment.save();
                    campground.comments.push(comment);
                    campground.save()
                    res.redirect('/campgrounds/'+campground._id)
                }
            })
        }
    })
    
})

//edit and update
router.get('/:comment_id/edit',checkCommentOwnership,function(req,res){
    Comment.findById(req.params.comment_id,function(err,foundComment){
        if(err){
            console.log(err)
            res.redirect('back')
        }
        else{
            res.render('comments/edit',{comment:foundComment,campground_id:req.params.id})
        }
    })
    
})

router.put('/:comment_id',checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err){
            console.log(err)
            res.redirect('back')
        }
        else{
            res.redirect('/campgrounds/'+ req.params.id);
        }
    })
    
})

//destroy
router.delete('/:comment_id',checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            console.log(err)
            res.redirect('/campgrounds/'+ req.params.id)
        }
        else{
            res.redirect('/campgrounds/'+ req.params.id);
        }
    })
    
})


function checkCommentOwnership(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
               // does user own the campground?
            if(foundComment.author.id.equals(req.user._id)) {
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