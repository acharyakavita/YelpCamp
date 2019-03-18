const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const Comment=require('./models/comment');
const seedDB=require('./seeds.js');
const mongoose=require('mongoose');
const Campground=require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp_camp',{ useNewUrlParser: true });

app.use(bodyparser.urlencoded({extended:true}))

app.set('view engine','ejs')

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
            res.render('index',{campground:allCamps})
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

    res.render('new')
})

app.get('/campgrounds/:id',function(req,res){
    Campground.findById(req.params.id,function(err,foundCamp){
        if(err){
            console.log(err)
        }
        else{
            res.render('show',{campground:foundCamp})
        }
    })
})

app.listen('3000',function(){
    console.log('server is running')
})