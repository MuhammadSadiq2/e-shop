const {User} = require("../database/user");

module.exports = async  (req, res, next) => {
    const storedUser = await User.findById(req.user.id);
    if (!storedUser || !storedUser.isAdmin) {
      return res.json({ message: "you don't have permission to access" });
    }
    next();
};
