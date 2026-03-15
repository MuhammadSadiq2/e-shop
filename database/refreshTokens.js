const mongoose = require('mongoose')

const refreshTokenSchema = mongoose.Schema({
    refreshToken:{
        type:String
    },
    token_id:{
        type:String
    }
})
refreshTokenSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

refreshTokenSchema.set('toJSON',{virtuals:true})

exports.RefreshToken = mongoose.model("RefreshToken",refreshTokenSchema)
exports.refreshTokenSchema = refreshTokenSchema