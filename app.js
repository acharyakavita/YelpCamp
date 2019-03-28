require('dotenv').config();
const express=require('express');
const app=express();
const methodOverride=require('method-override');
const bodyparser=require('body-parser');
//const seedDB=require('./seeds.js');
const mongoose=require('mongoose');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const flash=require('connect-flash')

const commentRoutes=require('./routes/comments');
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes= require('./routes/reviews');
const authRoutes=require('./routes/index');
app.locals.moment = require('moment');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@yelpcamp-ev02f.mongodb.net/test?retryWrites=true`;
//mongoose.connect('mongodb://localhost:27017/yelp_camp',{ useNewUrlParser: true });
mongoose.connect(uri,{ useNewUrlParser: true });
app.use(bodyparser.urlencoded({extended:true}))

app.set('view engine','ejs')
var path = require ('path');
app.use(express.static(path.join(__dirname+'.../public')))
app.use(methodOverride("_method"));
app.use(flash())

//passport configuration
app.use(require('express-session')({
    secret:'hi',
    resave:false,
    saveUninitialized:false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 60000 }
}))


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//middleware to passe the user name in every route
app.use(async function(req,res,next){
    res.locals.currentUser=req.user
    if(req.user) {
        try {
          let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
          res.locals.notifications = user.notifications.reverse();
        } catch(err) {
          console.log(err.message);
        }
       }
    res.locals.error=req.flash('error')
    res.locals.success=req.flash('success')
    next();
})

//require routes
app.use(authRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/comments',commentRoutes);
app.use('/campgrounds/:id/reviews',reviewRoutes);

var port = process.env.PORT || 8080;
app.listen(port,process.env.IP,function(){
//app.listen('3000',function(){
    console.log('server is running')
})