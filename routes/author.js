var router = module.exports = require('express').Router();
var params = require('express-params');
params.extend(router);
var bcrypt = require('bcrypt');
var _ = require('lodash');
var oneYear = 365*24*60*60*1000
var crypto = require('crypto');
var canEdit = require('../lib/middleware/canEdit');
var extend = require('config-extend');
var async = require('async');

router.param('uid', /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/);

/*
 * Update a field on an existing author
 * Invoked from Angular with author.$save()
 */
router.post('/:uid', canEdit, function(req, res, next) {
  req.author.update(req.body, function(err, author) {
    if (err) return next(err);
    res.status(200).json(author.toJson());
  });
}); 

/*
 * Create a new author
 * Invoked from Angular with Api.Author.create()
 */
router.post('/', function(req, res, next) {
  var data = {
    penname: req.body.penname,
    email: req.body.email
  };
  if (req.body.password !== req.body.confirm) res.standard(400);
  else {
    bcrypt.hash(req.body.password, 10, function(err, hash) {
      data.password = hash;
      req.models.Author.create(data, function(err, author) {
        if (err) return next(err);
        res.cookie('author', author.encrypt(), { path: '/', maxAge: oneYear });
        res.status(200).json(author.toJson());
      });
    });
  }
});

/*
 * Lookup an author by uid
 * Invoked from angular with Api.Author.get() or Api.Author.query()
 */
router.get('/:uid', function(req, res, next) {
  req.models.Author.get(req.params.uid, function(err, author) {
    if (err) return next(err);
    res.status(200).json(author.toJson());
  });
});

router.get('/:type', function(req, res, next) {
  req.author.getAllByType(req.params.type, function(err, nodes) {
    res.status(200).json(_(nodes).values().flatten().value());
  });
});

/*
 * Get currently logged in member, login, or check whether an email already exists
 * Invoked from angular with Api.author.get()
 */
router.get('/', function(req, res, next) {
  if (req.query.email) {
    req.models.Author.findOne({ email: req.query.email }, function(err, author) {
      if (err) next(err);
      // No author found with this email. Good if joining, bad if logging in.
      else if (!author) res.standard(404);
      // An author exists with this email, which may or may not be the current user
      else {
        // Trying to join, but email already exists
        if (!req.query.password) res.standard(409);
        // Logging in
        else {
          // Check that the passwords match
          bcrypt.compare(req.query.password, author.data.password, function(err, match) {
            if (err) next(err);
            else if (!match) res.sendError('Invalid email or password.');
            else {
              res.cookie('author', author.encrypt(), { path: '/', maxAge: oneYear });
              author.getAllByType(['story', 'world'], function(err, nodes) {
                res.status(200).json(extend(author.toJson(), nodes));
              });
            }
          });
        }
      }
    });
  // Not querying for author by email. If we have a logged in user, return that.
  } else if (req.author) {
    // If we're requesting additional resources with the author, fetch them now
    if (req.query.include) {
      req.author.getAllByType(req.query.include, function(err, nodes) {
        var author = req.author.toJson();
        res.status(200).json(extend(author, nodes));
      });
    } else {
      res.status(200).json(req.author.toJson());
    }
  } else {
    res.standard(404);
  }
});

/*
 * Update an author
 * Invoked from angular with Api.Author.update
 */
router.put('/:uid', canEdit, function(req, res, next) {
  // Author changing emails
  if (req.body.email) {
    req.models.Author.findOne({ email: req.body.email }, function(err, author) {
      if (err) next(err);
      else if (author) res.status(400).json({ error: 'That email is already registered.' });
      else {
        req.author.changeEmail(req.body.email, function(err, author) {
          if (err) next(err);
          else res.status(200).json(author.toJson());
        });
      }
    });
  // Author changing passwords
  } else if (req.body.oldPw && req.author) {
    bcrypt.compare(req.body.oldPw, req.author.data.password, function(err, match) {
      if (err) next(err);
      else if (!match) res.sendError('Invalid password.');
      else if (req.body.newPw === req.body.confirm) {
        bcrypt.hash(req.body.newPw, 10, function(err, hash) {
          author.update({ password: hash }, function(err, author) {
            if (err) next(err);
            else res.status(200).json(author.toJson());
          });
        });
      } else res.sendError('The new passwords do not match.');
    });
  } else {
    // Author updating other fields
    req.author.update(_.omit(req.body, 'id'), function(err, author) {
      if (err) next(err);
      else res.status(200).json(author.toJson());
    });
  }
});
