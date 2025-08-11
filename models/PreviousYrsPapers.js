import mongoose from "mongoose"
const PrevYrsPapersSchema=mongoose.Schema({
    year:{
      type:Number,
      required:true  
    },
    filename:{
        type:String,
        required:true
    },
    data:{
        type:Buffer,
        required:true
    },
    contentType:{
        type:String,
        required:true
    },

},{timestamps:true})

export default mongoose.model('PrevYrsPapers',PrevYrsPapersSchema) 