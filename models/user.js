var mongoose = require("mongoose");
const passportLocalMongoose=require('passport-local-mongoose');
 
var userSchema = new mongoose.Schema({
    username: {type:String,unique:true,required:true},
    password: String,
    isAdmin:{type:Boolean,default:false},
    avatar:String,
    firstName:String,
    lastName:String,
    email:{type:String,unique:true,required:true},
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    aboutMe:String,
    notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ]
});
 
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);