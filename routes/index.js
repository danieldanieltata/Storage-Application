var express = require('express');
var mongoose = require('mongoose');
var ItemModelsSchema = require('../models/itemModels.js');

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
  var item = new ItemModelsSchema({name: 'Test', amount: 5, itemType: 'Switch'});
});

// GET from the DB all the Item Models by using query search 
// @param req.quert.itemType is a query in the url using ?itemType=...
router.get('/getItemModelsFromDB', function(req, res, next){
  itemTypeQuery = req.query.itemType ;

  ItemModelsSchema.find({'itemType': itemTypeQuery}).then(function(documents){
    res.send(documents);
  });

});

module.exports = router;
