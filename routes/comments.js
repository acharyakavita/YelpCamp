const express=require('express')
const router=express.Router({mergeParams:true})// to pass req.params.id
const Campground=require('../models/campground');
const Comment=require('../models/comment');
const middleware=require('../middleware/index');

// comments routes


//new comment
router.get('/new',middleware.isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            req.flash('error','something went wrong' )
            console.log(err)
        }
        else{
            res.render('comments/new',{campground:campground})
        }
    })
    
})

//new comment post
router.post('/',middleware.isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err)
            req.flash('error','Your comment cannot be added' )
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
                    req.flash('success','Your comment has been posted' )
                    res.redirect('/campgrounds/'+campground._id)
                }
            })
        }
    })
    
})

//edit and update
router.get('/:comment_id/edit',middleware.checkCommentOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,foundCamp){
        if(err || !foundCamp){
            console.log(err)
            req.flash('error','Campground not found' )
            return res.redirect('back')
        }
        Comment.findById(req.params.comment_id,function(err,foundComment){
            if(err || !foundComment){
                console.log(err)
                req.flash('error','Comment not found' )
                res.redirect('back')
            }
            else{         
                res.render('comments/edit',{comment:foundComment,campground_id:req.params.id})
            }
        })
    })
    
})

router.put('/:comment_id',middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
        if(err){
            console.log(err)
            req.flash('error','Comment not found' )
            res.redirect('/campgrounds')
        }
        else{
            req.flash('success','Your comment has been edited' )
            res.redirect('/campgrounds/'+ req.params.id);
        }
    })
    
})

//destroy
router.delete('/:comment_id',middleware.checkCommentOwnership,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            console.log(err)
            req.flash('error','something went wrong' )
            res.redirect('/campgrounds/'+ req.params.id)
        }
        else{
            req.flash('success','Your comment has been deleted' )
            res.redirect('/campgrounds/'+ req.params.id);
        }
    })
    
})



module.exports=router;