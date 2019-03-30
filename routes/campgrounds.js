const express=require('express')
const router=express.Router()
const Campground=require('../models/campground');
const Comment=require('../models/comment');
const User=require('../models/user');
const middleware=require('../middleware/index');
var Notification = require("../models/notification");
var Review = require("../models/review");

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


//image upload
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'drlhqwxlt', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//campgrounds
router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allCampgrounds.length < 1) {
                        noMatch = "No campgrounds match that query, please try again.";
                    }
                    res.render("campgrounds/index", {
                        campground: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campground: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
//post new campground
router.post('/',middleware.isLoggedIn,upload.single('image'),function(req,res){
    let newCampground=new Object();
    let author={}
    newCampground.name= req.body.name
    newCampground.price= req.body.price
    newCampground.description=req.body.description
    author.id=req.user._id
    author.username=req.user.username
    newCampground.author=author;

    geocoder.geocode(req.body.location, function(err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;

        newCampground.location=location
        newCampground.lat=lat
        newCampground.lng=lng
        cloudinary.v2.uploader.upload(req.file.path,async function(err,result) {
        // add cloudinary url for the image to the campground object under image property
        newCampground.image=result.secure_url
        newCampground.imageId=result.public_id

        try {
            let campground = await Campground.create(newCampground);
            let user = await User.findById(req.user._id).populate('followers').exec();
            let newNotification = {
              username: req.user.username,
              campgroundId: campground.id
            }
            for(const follower of user.followers) {
              let notification = await Notification.create(newNotification);
              follower.notifications.push(notification);
              follower.save();
            }
      
            //redirect back to campgrounds page
            req.flash('success','New campground has been added')
            res.redirect(`/campgrounds/${campground.id}`);
          } catch(err) {
            req.flash('error', err.message);
            res.redirect('back');
          }

    })
})  
})

//add new campground
router.get('/new',middleware.isLoggedIn,function(req,res){
    res.render('campgrounds/new')
})


//more info about campground
router.get('/:id',function(req,res){
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).
    exec(function(err,foundCamp){
        if(err || !foundCamp){
            req.flash('error','Campground not found' )
            res.redirect('back')
        }
        else{
            res.render('campgrounds/show',{campground:foundCamp})
        }
    });
})


//edit and update
router.get('/:id/edit',middleware.checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,foundCamp){
        if(err){
            console.log(err)
            req.flash('error','Campground not found')
            res.redirect('/campgrounds')
        }
        else{
            res.render('campgrounds/edit',{campground:foundCamp})
        }
    })
    
})

router.put('/:id',middleware.checkCampgroundOwnership,upload.single('image'),function(req,res){
    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
       // delete req.body.campground.rating;
        Campground.findById(req.params.id, async function(err, campground){
            console.log(campground)
        if(err){
            console.log(err)
            req.flash('error',err.message)
            res.redirect('/campgrounds')
        }
        else{
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                } catch(err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
              }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.price=req.body.price;
            campground.location=data[0].formattedAddress;
            campground.lat=data[0].latitude;
            campground.lng=data[0].longitude;
            campground.save();
            req.flash('success','Campground edited')
            console.log("/campgrounds/" + req.params.id)
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
})
})

//destroy
router.delete('/:id',middleware.checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id, async function(err, campground) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(campground.imageId);
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                campground.remove();
                req.flash('success', 'Campground deleted successfully!');
                res.redirect('/campgrounds');
                })})
            
        } catch(err) {
            if(err) {
              req.flash("error", err.message);
              return res.redirect("back");
            }
        }
      });
})



module.exports=router;