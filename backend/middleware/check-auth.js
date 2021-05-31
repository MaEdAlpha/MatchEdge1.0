const jwt = require ("jsonwebtoken");


module.exports = (req, res, next) => {
  //split token out of header request and store it as a constant.
  try{
    // console.log(req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    console.log('Auth Check triggered');
    //token  + private Key JWT_KEY
    jwt.verify(token, "0A6aKFksbmPgDlIKiUGcMm82eycRgTivqkZx4zjDJn2CWm9LF5Kq5wnKltq4Uk3Zlpt9UJxbf");
    next();
  }catch (e) {
    res.status(401).json({message: "Auth Failed!"});
  }
}
