var express = require('express');
var router = express.Router();
var path = require('path');
var ta = require('time-ago')
var db = require('../utils/handlers/user');
var textParser = require('../utils/text-parser')
var formParser = require('../utils/form-parser');


router.get('/:category', function(req, res, next) {
  db.getAll((err, users) => {
	var postList = [];
	for(var user of users){
		for(var post of user.posts) {
			post.timeago = ta.ago(post.createdAt);
			postList.push({author: user,post});
		}
	}
	postList.sort((one,two) => new Date(two.post.createdAt) - new Date(one.post.createdAt));
  	res.render('category', {
  		title: req.app.conf.name,
		people: users,
		postList: postList,  
  		category:req.params.category
  	});
  });  
});

module.exports = router;