const jwt = require ("jsonwebtoken");

module.exports = (req, res, next) => {
  //split token out of header request and store it as a constant.
  try{
    console.log(req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    jwt.verify(token, "super_secret_key");
    next();
  }catch (e) {
    res.status(401).json({message: "Auth Failed!"});
  }
}
