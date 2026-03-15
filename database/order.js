const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    orderItem:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'OrderItem'
    }],
    shippingAddress1:{
        type:String
    },
    shippingAddress2:{
        type:String
    },
    city:{
        type:String
    },
    zip:{
        type:Number
    },
    country:{
        type:String
    },
    phone:{
        type:Number
    },
    status:{
        type:String,
        default:"pending"
    },
    totalPrice:{
        type:Number
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    orderingDate:{
        type:Date,
        default:Date.now()
    }
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

orderSchema.set('toJSON',{virtuals:true})

exports.Order = mongoose.model("Order",orderSchema)
exports.orderSchema = orderSchema