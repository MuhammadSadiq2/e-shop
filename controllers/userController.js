const {User} = require('../database/user')

exports.getUsers = async (req,res) => {

    const users = await User.find().select("-hashedPassword")

    if(!users){
        return res.status(400).json({message:'users not found'})
    }
    
    res.status(200).json({users})

}

exports.getUser = async  (req,res) => {

    const user = await User.findById(req.params.id).select("-hashedPassword")

    if(!user){
        return res.status(400).json({message:'users not found'})
    }
    
    res.status(200).json({user})

}

exports.updateUserData = async (req,res) => {

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
        username: req.body.username,
        email: req.body.email,
        hashedPassword: req.body.hashedPassword,
        city: req.body.city,
        street: req.body.street,
        apartment: req.body.apartment,
        phone: req.body.phone,
        country: req.body.country,
        zip: req.body.zip,
        isAdmin: req.body.isAdmin,
        },
        { new: true }
    )
    const updatedUser = await user.save()

    if(!updatedUser){
        return res.status(400).json({message:"user not updated"})
    }
    res.status(200).json({user})
}

exports.deleteUser = async (req,res) => {

    await User.findByIdAndDelete(req.params.id)
    .then(user => {
      if(user){
        return res.status(200).json({message:"user was removed"})
      }else{
        return res.status(404).json({message:'user not found'})
      }
    }).catch(error => {
      return res.status(400).json({err:error})
    })

}