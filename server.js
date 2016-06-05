(function(){"use strict";})();
var request = require('request'); 
var moment = require('moment');
var mail = require('nodemailer');
var lastWeek = moment().subtract(7, 'days').unix();
var sort = require('node-sort');
var stories = [];
var top = [];
var offFlag = false;

var express = require('express');
var app = express();
var path = require('path');

var port = process.env.PORT || '3000';

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(path.normalize(__dirname + '/')));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/recent', function(req, res){
  res.send(JSON.stringify(top));
});

var server = app.listen(port, function() {
  var host = server.address().address;
  console.log('reverse155 is listening at http://%s:%s -- %s', host, port);
});

getLast();
setInterval(getLast, 86400000);

function getLast(){
  //get last id of item
  request('https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty', function(err, res, body){
    var id = body-1;
    var a;
    var clearIt = function(){
      clearInterval(a);
    }
    a = setInterval(function(){
      request('https://hacker-news.firebaseio.com/v0/item/'+id+'.json?print=pretty', function(err, res, body){
        if(err){
          console.log(err);
        }
        body = JSON.parse(body);
        if(body.time < lastWeek){
          clearIt();
          if(!offFlag){
            offFlag = true;
            getTop10();
          }
          //console.log('ENDED: ', stories);
        } else if(body.type === 'story' && body.score > 1){
          console.log(body.time - lastWeek);
          stories.push(body);
        }
        id--;
      })
    }, 7);
  });
}

function removeDupes(arr){
  var ids = [];
  var newArr = [];
  arr.forEach(function(val, ind){
    if(ids.indexOf(val.id) === -1){
      ids.push(val.id);
      newArr.push(val);
    }
  });
  return newArr;
}

function getTop10(){
  top = stories.sort(function(a, b){
    return b.score - a.score;
  });
  console.log('sorted');
  top = removeDupes(top);
  console.log('deduped');
  top.splice(10, top.length);
  console.log('reduced');
}

