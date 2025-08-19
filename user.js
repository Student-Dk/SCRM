const mongoose=require('mongoose');
const userschema=mongoose.Schema({
    name:String,
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:String,
    contact:String,
    gender:String,
    address:String,
    company:String,
    query:String,
    date:{type:Date},
    services: [String],
    // subject:String,
    // tasktype:String,
    // priority:String,
    // description:String,
    remark:String,
    //adminresponse:String
    
   
   
})
module.exports=mongoose.model('user',userschema);

