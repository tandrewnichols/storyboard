module.exports = function(req, res, next, uid) {
  delete req.body.uid;
  next();
};
