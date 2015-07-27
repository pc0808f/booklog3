var express = require('express');
var router = express.Router();
var events = require('events');
var winston = require('winston');
var history = [];
var cors = require('cors');
winston.add(winston.transports.File, { 
  name: 'booklog-chat',
  filename: 'booklog-chat-info.log',
  level: 'info'
});



/* GET home page. */
router.get('/hello', cors(), function(req, res, next) {
  res.render('index', { title: 'Jollen' });
});



/*
 * GET chat messages
 */

router.get('/start', function(req, res, next) {
    var workflow = new events.EventEmitter();  

    workflow.outcome = {
        success: false,
        errfor: {},
        data:{}
    };

    workflow.on('start', function() {
        workflow.outcome.data = history;
        workflow.emit('response');
    });

    workflow.on('response', function() {
        console.log('get /start');
        workflow.outcome.data = history;
        workflow.outcome.success = true;
        res.send(workflow.outcome);
    });

    workflow.emit('start');
});


/*
 * POST chat message
 */

router.post('/send/:message', function(req, res, next) {
    var workflow = new events.EventEmitter();  
    var clients = req.app.clients;
    var msg = req.params.message;
    var obj = {};
    var milliseconds = new Date().getTime();

    workflow.outcome = {
        success: false,
        errfor: {}
    };

    workflow.on('init', function() {
        obj.message = msg;
        obj.timestamp = milliseconds;
        history.push(obj);
        workflow.emit('broadcast');
    });

    workflow.on('broadcast', function() {
        for(i=0;i<clients.length;i++){
             var client = clients[i];
             var data ={
                type : 'message',
                data : history
             };
             client.sendUTF(JSON.stringify(data));
        }
        workflow.outcome.success = true;
        workflow.emit('response');
    });
   
    workflow.on('response', function() {
        console.log('post /send');
        res.send(workflow.outcome);
    });

    workflow.emit('init');
});


module.exports = router;