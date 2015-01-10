var router = module.exports = require('express').Router();

router.get('*', function(req, res) {
  if (req.author) {
    res.render('index', { author: req.author.get() });
  } else {
    res.render('index', {});
  }
});
