module.exports = function(req, res, next) {
  if (req.cookies.author) {
    req.models.Author.get(req.models.Author.decrypt(req.cookies.author), function(err, author) {
      if (err) {
        req.author = null;
      } else {
        req.author = author;
      }
      next();
    });
  } else {
    req.author = null;
    next();
  }
};
