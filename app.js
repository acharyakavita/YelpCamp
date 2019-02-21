const express=require('express');
const app=express();
const bodyparser=require('body-parser');
const mongoose=require('mongoose');

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });

app.use(bodyparser.urlencoded({extended:true}))

//schema setup
const campgroundSchema= new mongoose.Schema({
    name:String,
    image:String
})

const Campground=mongoose.model('Campground',campgroundSchema);


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
            res.render('campgrounds',{campground:allCamps})
        }
    })
    
})

app.post('/campgrounds',function(req,res){
    let newCampground=new Object();
    newCampground.name= req.body.name
    newCampground.image=req.body.url
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

app.listen('3000',function(){
    console.log('server is running')
})