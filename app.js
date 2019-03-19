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

//middleware to passe the user name in every route
app.use(function(req,res,next){
    res.locals.currentUser=req.user
    next();
})

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

app.post('/campgrounds',isLoggedIn,function(req,res){
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

app.get('/campgrounds/new',isLoggedIn,function(req,res){
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

app.get('/campgrounds/:id/comments/new',isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err)
        }
        else{
            res.render('comments/new',{campground:campground})
        }
    })
    
})

app.post('/campgrounds/:id/comments',isLoggedIn,function(req,res){
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

//auth routes
//show register form

app.get('/register',function(req,res){
    res.render('register')
})

app.post('/register',function(req,res){
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
app.get('/login',function(req,res){
    res.render('login')
})
//(route,middleware,callback)
app.post('/login',passport.authenticate('local',{
    //middleware
    successRedirect:'/campgrounds',
    failureRedirect:'/login'
    }),function(req,res){})


app.get('/logout',function(req,res){
    req.logout();
    res.redirect('/campgrounds')
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}
app.listen('3000',function(){
    console.log('server is running')
})