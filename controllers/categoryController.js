const {Category} = require("../database/category")



exports.getCategories = async (req, res) => {
    const categories = await Category.find()

    if(!categories){
        return res.status(400).json({message:"categories not found"})
    }

    res.status(200).json({categories})
};

exports.getCategory = async (req, res) => {
    const category = await Category.findById()

    if(!category){
        return res.status(400).json({message:"category not found"})
    }

    res.status(200).json({category})
};

exports.addCategory = async (req,res) => {
     const category = new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color,
        image:req.body.image
         }) 
        const newCategory = await category.save()
         if(!newCategory){
             return res.status(400).json({message:"category not saved"})
         }
         res.status(200).json({newCategory})
}

exports.updateCategory = async (req,res) => {
    
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color,
        image:req.body.image
        },
        {new:true}
    )
    const updatedCategory = await category.save()
    if(!updatedCategory){
        return res.status(400).json({message:"category not updated"})
    }
    res.status(200).json({updatedCategory})
}


exports.deleteCategory = async (req,res) => {
    await Category.findByIdAndDelete(req.params.id)
    .then(category => {
      if(category){
        return res.status(200).json({message:"category is removed"})
      }else{
        return res.status(404).json({message:'category not found'})
      }
    }).catch(error => {
      return res.status(400).json({err:error})
    })    
}