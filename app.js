const express=require('express');
let app=express();
let bodyparser=require('body-parser');


app.use(bodyparser.urlencoded({extended:true}))
let campground=[{name:'salmon-creek', image:'https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_1280.jpg'},
{name:'Granite Hill',image:'https://cdn.pixabay.com/photo/2016/11/29/04/17/bonfire-1867275_1280.jpg'},{name:'salmon-creek', image:'https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_1280.jpg'},
{name:'Granite Hill',image:'https://cdn.pixabay.com/photo/2016/11/29/04/17/bonfire-1867275_1280.jpg'},
{name:'salmon-creek', image:'https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_1280.jpg'},
{name:'Granite Hill',image:'https://cdn.pixabay.com/photo/2016/11/29/04/17/bonfire-1867275_1280.jpg'},{name:'salmon-creek', image:'https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_1280.jpg'},
{name:'Granite Hill',image:'https://cdn.pixabay.com/photo/2016/11/29/04/17/bonfire-1867275_1280.jpg'},
{name:'salmon-creek', image:'https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_1280.jpg'},
{name:'Granite Hill',image:'https://cdn.pixabay.com/photo/2016/11/29/04/17/bonfire-1867275_1280.jpg'},
{name:'salmon-creek', image:'https://cdn.pixabay.com/photo/2016/02/18/22/16/tent-1208201_1280.jpg'},
{name:'Granite Hill',image:'https://cdn.pixabay.com/photo/2016/11/29/04/17/bonfire-1867275_1280.jpg'}]

app.set('view engine','ejs')

app.get('/',function(req,res){
    res.render('landing')
})

app.get('/campgrounds',function(req,res){
    res.render('campgrounds',{campground:campground})
})

app.post('/campgrounds',function(req,res){
    let newCampground=new Object();
    newCampground.name= req.body.name
    newCampground.image=req.body.url
    campground.push(newCampground)
    res.redirect('/campgrounds')
})

app.get('/campgrounds/new',function(req,res){

    res.render('new')
})

app.listen('3000',function(){
    console.log('server is running')
})