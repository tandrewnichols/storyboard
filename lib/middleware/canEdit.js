module.exports = function(req, res, next) {
  if (req.author) {
    req.author.canEdit(req.params.uid, function(err, node) {
      if (err) return res.standard(403);
      req.queriedNode = node;
      next();
    });
  } else {
    res.standard(401);
  }
};
