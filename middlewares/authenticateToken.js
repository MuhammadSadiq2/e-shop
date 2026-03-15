const jwt = require("jsonwebtoken");
ACCESS_TOKEN = process.env.ACCESS_TOKEN;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ message: "token required" });
  }
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(400).json({ message: " invalid token" });
  }
  let decoded;
  try {
    decoded = jwt.verify(token, ACCESS_TOKEN);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: " invalid or expired token" });
  }
};
