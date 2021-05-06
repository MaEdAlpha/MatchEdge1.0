const jwt = require ("jsonwebtoken");

module.exports = (req, res, next) => {
  //split token out of header request and store it as a constant.
  try{
    // console.log(req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    console.log('Auth Check triggered');
    //token  + private Key
    jwt.verify(token, "ALK!838(KjlIj__+9129JAqjL110}23");
    next();
  }catch (e) {
    res.status(401).json({message: "Auth Failed!"});
  }
}
