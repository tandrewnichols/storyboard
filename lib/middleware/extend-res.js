module.exports = function(req, res, next) {
  res.sendError = function(err) {
    res.status(500).json({ description: (err instanceof Error ? err.message : err), stack: (err instanceof Error ? err.stack : new Error().stack)});
  };

  res.standard = function(status) {
    res.status(status);
    switch (status) {
      case 400:
        res.json({ description: 'Bad Request' });
        break;
      case 401:
        res.json({ description: 'Unauthorized' });
        break;
      case 403:
        res.json({ description: 'Forbidden' });
        break;
      case 404:
        res.json({ description: 'Not Found' });
        break;
      case 409:
        res.json({ description: 'Conflict' });
        break;
      case 410:
        res.json({ description: 'Gone' });
        break;
      case 501:
        res.json({ description: 'Not Implemented' });
        break;
      default:
        res.status(500).end();
        break;
    }
  };

  next();
};
