const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json("You are not authenticated!");
  }
  jwt.verify(token, process.env.SECRET, async (error, data) => {
    if (error) {
      return res.status(403).json("Token Invalid!");
    }
    req.userId = data._id;
    next();
  });
};

module.exports = verifyToken;
