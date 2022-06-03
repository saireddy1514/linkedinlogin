const mongoose=require('mongoose');
const schema=mongoose.Schema;
const userSchema=new schema(
    {
       id:String,
       displayName:String,
       firstName:String,
       lastName:String,
       email:String,
       password:String
    })
module.exports=mongoose.model('user',userSchema);
