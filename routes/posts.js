var express = require('express');
var router = express.Router();

router.get('/1/post', function(req, res, next) {
  req.app.db.model.Post.find({}, function(err, posts) {
  	res.json(posts);
  });
});

router.get('/1/post/:id', function(req, res, next) {
  req.app.db.model.Post.findById(req.params.id, function(err, posts) {
  	res.json(posts);
  });
});

router.post('/1/post', function(req, res, next) {
  var Post = req.app.db.model.Post;
  
  var instance = new Post({
    title: req.query.title,
    content: req.query.content
  });

  instance.save();

  res.json("create a new post");
});

router.delete('/1/post/:id', function(req, res, next) {
  req.app.db.model.Post.findByIdAndRemove(req.params.id, function(err, posts) {
  	res.json(posts);
  });
});

router.put('/1/post/:id', function(req, res, next) {
  var fieldsToSet = {
  	title: req.query.title,
  	content: req.query.content
  };

  req.app.db.model.Post.findOneAndUpdate({_id: req.params.id}, fieldsToSet, function(err, post) {
  	res.json(post);
  });
});

module.exports = router;
