module.exports = function(req, res, next) {
  if (req.author) {
    req.author.isConnected(req.params.uid, function(err, exists) {
      if (err) res.sendError(err);
      else if (!exists) res.status(403).json({ description: 'Forbidden' });
      else next();
    });
  } else {
    rest.status(403).json({ description: 'Forbidden' });
  }
};
