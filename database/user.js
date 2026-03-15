const mongoose = require('mongoose')

const userSchema = mongoose.Schema({

    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true
    },
    hashedPassword:{
        type:String,
        required:true
    },
    city:{
        type:String
    },
    street:{
        type:String
    },
    apartment:{
        type:String
    },
    phone:{
        type:Number,
        required:true
    },
    country:{
        type:String
    },
    zip:{
        type:Number
    },
    isAdmin:{
        type:Boolean,
        default:false
    }

})

userSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

userSchema.set('toJSON',{virtuals:true})

exports.User = mongoose.model("User",userSchema)
exports.userSchema = userSchema