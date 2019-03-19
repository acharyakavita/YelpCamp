const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const seedDB=require('./seeds.js');
const mongoose=require('mongoose');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');

const commentRoutes=require('./routes/comments');
const campgroundRoutes=require('./routes/campgrounds');
const authRoutes=require('./routes/index');

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

//require routes
app.use(authRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/comments',commentRoutes);

app.listen('3000',function(){
    console.log('server is running')
})