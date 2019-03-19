const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const Comment=require('./models/comment');
const seedDB=require('./seeds.js');
const mongoose=require('mongoose');
const Campground=require('./models/campground');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');

mongoose.connect('mongodb://localhost:27017/yelp_camp',{ useNewUrlParser: true });

app.use(bodyparser.urlencoded({extended:true}))

app.set('view engine','ejs')
app.use(express.static(__dirname+'/public'))

//passport configuration
app.use(require('express-session')({
    secret:'hi',
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.get('/',function(req,res){
    res.render('landing')
})


app.get('/campgrounds',function(req,res){
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

app.post('/campgrounds',function(req,res){
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

app.get('/campgrounds/new',function(req,res){
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id',function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCamp){
        if(err){
            console.log(err)
        }
        else{
            res.render('campgrounds/show',{campground:foundCamp})
        }
    });
})

// comments routes

app.get('/campgrounds/:id/comments/new',function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err)
        }
        else{
            res.render('comments/new',{campground:campground})
        }
    })
    
})

app.post('/campgrounds/:id/comments',function(req,res){
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
app.listen('3000',function(){
    console.log('server is running')
})