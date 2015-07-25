var express = require('express');
var router = express.Router();
var events = require('events');
var winston = require('winston');

winston.add(winston.transports.File, { 
  name: 'booklog3-1',
  filename: 'booklog-Auth-info.log',
  level: 'info'
});


function ensureAuthenticate(req, res, next) {
  if (req.isAuthenticated()) {
  Winston.log('info', req.user.displayname);
  return next(); }
  res.redirect('/login/facebook');
}

router.get('/1/post', ensureAuthenticate);
router.get('/1/post', function(req, res, next) {
  var workflow = new events.EventEmitter();  
  var Post = req.app.db.model.Post;

  workflow.outcome = {
      success: false,
      errfor: {}
  };

  workflow.on('validation', function() {
    workflow.emit('readPost');
  });

  workflow.on('readPost', function() {
    Post
      .find({})
      .populate('userId')
      .exec(function(err, posts) {
        workflow.outcome.success = true;
        workflow.outcome.posts = posts;
        workflow.emit('response');
      });
  });

  workflow.on('response', function() {
      res.send(workflow.outcome);
  });
  
  workflow.emit('validation');
});

router.get('/1/post/:id', ensureAuthenticate);
router.get('/1/post/:id', function(req, res, next) {
  req.app.db.model.Post.findById(req.params.id, function(err, posts) {
  	res.json(posts);
  });
});

router.post('/1/post', ensureAuthenticate);
router.post('/1/post', function(req, res, next) {
  var workflow = new events.EventEmitter();  
  var Post = req.app.db.model.Post;

  workflow.outcome = {
      success: false,
      errfor: {}
  };

  workflow.on('validation', function() {
    if (req.body.title.length === 0) 
        workflow.outcome.errfor.title = '這是必填欄位';
  
    if (typeof(req.body.content) === 'undefined' 
        || req.body.content.length === 0)
        workflow.outcome.errfor.content = '這是必填欄位';
  
    if (Object.keys(workflow.outcome.errfor).length !== 0) {
        workflow.outcome.success = false;
        return workflow.emit('response');
    }
  
    workflow.emit('savePost');
  });

  workflow.on('savePost', function() {
    var doc = new Post({
      title: req.body.title,
      content: req.body.content,
      userId: req.user._id
    });
  
    doc.save(function(err, post) {
      workflow.outcome.success = true;
      workflow.outcome.post = post;

      workflow.emit('response');
    });
  });

  workflow.on('response', function() {
      res.send(workflow.outcome);
  });
  
  workflow.emit('validation');
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
