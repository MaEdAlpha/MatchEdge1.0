const jwt = require ("jsonwebtoken");
const env = require("dotenv").config({ path: envFilePath });


module.exports = (req, res, next) => {
  //split token out of header request and store it as a constant.
  try{
    // console.log(req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    console.log('Auth Check triggered');
    //token  + private Key JWT_KEY
    jwt.verify(token, process.env.JWT_PVT_K);
    next();
  }catch (e) {
    res.status(401).json({message: "Auth Failed!"});
  }
}
