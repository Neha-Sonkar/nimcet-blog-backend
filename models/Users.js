import mongoose from "mongoose";
 const UserSchema=mongoose.Schema({
    email:{
      type:String,
      required:[true,"Email is required"],
      unique:[true,"Email must be unique"],
      trim:true,
      lowercase:true
    },
    password:{
      type:String,
      required:[true,"Password is required"],
      trim:true,
      select:false
    },
    forumNotify:{
      type:Boolean,
      default:false
    },
    verified:{
      type:Boolean,
      default:false
    },
    verifiedCode:{
      type:String,
      select:false
    },
    verifiedCodeValidationTime:{
      type:Number,
      select:false
    },
    changePasswordCode:{
      type:String,
      select:false
    },
    forgetPasswordCode:{
      type:String,
      select:false
    },
    forgetPasswordCodeValidationTime:{
      type:Number,
      select:false
    }
 },{timestamps:true})
export default mongoose.model('User',UserSchema)