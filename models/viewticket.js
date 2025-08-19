const mongoose=require('mongoose')

const viewticket=mongoose.Schema({


    userid:String,
    date:{type:Date},
    subject:String,
    tasktype:String,
    priority:String,

    
     description:String,
    adminresponse:String
})
module.exports=mongoose.model('vtc',viewticket)