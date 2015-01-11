module.exports = function(req, res, next) {
  if (!req.author) {
    res.standard(401);
  } else {
    next();
  }
};
