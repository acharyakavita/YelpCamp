const Campground=require('../models/campground');
const Comment=require('../models/comment');
let middlewareObj={}

//middlewares

middlewareObj.checkCommentOwnership=function checkCommentOwnership(req,res,next){
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
middlewareObj.isLoggedIn=function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

middlewareObj.checkCampgroundOwnership=function checkCampgroundOwnership(req,res,next){
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
module.exports=middlewareObj