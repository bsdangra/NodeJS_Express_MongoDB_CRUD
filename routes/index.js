var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var assert = require('assert');
var objID = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/test';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', errors: req.session.errors});
  req.session.errors = null;  
});

router.post('/insert', function(req, res, next){
	var employeedata = {
		empName: req.body.empName,
		designation: req.body.designation,
		company: req.body.company,
		emailID: req.body.emailID,
		loc: req.body.loc		
	};
	req.check('emailID', 'Invalid EmailID').isEmail();
	var error = req.validationErrors();
	if(error){
		req.session.errors = error;		
	}else{
		mongo.connect(url, function(err, db){
			assert.equal(null, err);
			db.collection('employeedata').insertOne(employeedata, function(err, result){
				assert.equal(null, err);
				db.close();				
			});
		});
	}
	res.redirect('/');
});


router.get('/read', function(req, res, next){
	var empData = []
	mongo.connect(url, function(err, db){
		assert.equal(null, err);	
		var cursor = db.collection('employeedata').find();
		cursor.forEach(function(doc, err){
			assert.equal(null, err);
			if(doc != null){
				empData.push(doc);
			}
		}, function(){
			db.close();
			res.render('index', {empData: empData});
		});
	});
});

router.post('/update', function(req, res, next){
	var id = req.body.userID;
	var employeedata = {
		empName: req.body.empName,
		designation: req.body.designation,
		company: req.body.company,
		emailID: req.body.emailID,
		loc: req.body.loc		
	};
	
	mongo.connect(url, function(err, db){
		assert.equal(null, err);
		db.collection('employeedata').updateOne({_id: objID(id)}, {$set: employeedata}, function(err, result){
			assert.equal(null, err);
			db.close();
			res.redirect('/read');
		});
	});
});

router.post('/delete', function(req, res, next){
	var id = req.body.userID;
	mongo.connect(url, function(err, db){
		db.collection('employeedata').deleteOne({_id: objID(id)}, function(err, result){
			assert.equal(null, err);
			db.close();
			res.redirect('/read');
		});
	});
});


module.exports = router;
