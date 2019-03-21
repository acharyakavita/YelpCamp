const express=require('express')
const router=express.Router()
const Campground=require('../models/campground');
const middleware=require('../middleware/index');

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
//campgrounds
router.get('/',function(req,res){
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                req.flash('error', 'Sorry, no campgrounds match your query. Please try again');
                return res.redirect('/');
              }
              res.render("campgrounds/index",{campground:allCampgrounds,page: 'campgrounds'});
           }
        })
    } else {
    Campground.find({},function(err,allCamps){
        if(err){
            console.log(err)
        }
        else
        {
            res.render('campgrounds/index',{campground:allCamps,page: 'campgrounds'})
        }
    })
}
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
//post new campground
router.post('/',middleware.isLoggedIn,function(req,res){
    let newCampground=new Object();
    let author={}
    newCampground.name= req.body.name
    newCampground.price= req.body.price
    newCampground.image=req.body.url
    newCampground.description=req.body.description

    author.id=req.user._id
    author.username=req.user.username
    newCampground.author=author;

    geocoder.geocode(req.body.location, function (err, data) {
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
    Campground.create(newCampground,function(err,newCamp){
        if(err){
            req.flash('error','Campground cannot be added')
            console.log(err)
        }
        else
        {   
            req.flash('success','New campground has been added')
            res.redirect('/campgrounds')
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
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCamp){
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

router.put('/:id',function(req,res){

    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

    let dataObj={name:req.body.name,image:req.body.url,description:req.body.description,price:req.body.price,location:req.body.campground.location,
    lat:req.body.campground.lat,lng:req.body.campground.lng}
    Campground.findByIdAndUpdate(req.params.id,dataObj,function(err,updatedCamp){
        if(err){
            console.log(err)
            req.flash('error','Campground edit failed')
            res.redirect('/campgrounds')
        }
        else{
            req.flash('success','Campground edited')
            res.redirect("/campgrounds/" + req.params.id);
        }
    })
})
})

//destroy
router.delete('/:id',middleware.checkCampgroundOwnership,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err)
            req.flash('success','Campground cannot be deleted')
            res.redirect('/campgrounds')
        }
        else{
            req.flash('success','Campground deleted')
            res.redirect("/campgrounds");
        }
    })
    
})



module.exports=router;