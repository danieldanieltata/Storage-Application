var express = require('express');
var mongoose = require('mongoose');

var ItemSchema = require('../models/item.js');
var ItemModelsSchema = require('../models/itemModels.js');

var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {

  // GET the Items List from the DB.
  ItemSchema.find({}).then(function(documents){
    res.render('index', {itemsList: documents});
  });

});

router.post('/postNewItemToDB', function(req, res){
    var newItem = {name: req.body['name'], tableFields: req.body['tablesFields[]']};
    
    var item = new ItemSchema(newItem);

    ItemSchema.find({name: newItem.name}).count(function(err, count){
      if(count > 0){
        res.status(200).send({'status': 500})
        return ;
      }

      item.save().then(res.status(200).send({'status': 200}));
    });

});

router.post('/addOrUpdateSelectedTableItems', function(res, req){
    var selctedTablesItemsJSON = res.body['selctedTablesItemsJSON'] ; 

    console.log(selctedTablesItemsJSON)
});

// GET from the DB all the Item Models by using query search 
// @param req.quert.itemType is a query in the url using ?itemType=...
router.get('/getItemModelsFromDB', function(req, res, next){
  var responseData = {};
  var itemTypeQuery = req.query.itemType ;

  ItemSchema.findOne({name: itemTypeQuery}, function(err, document){
    responseData.fields = document.tableFields ;
  })
  .then(ItemModelsSchema.find({'itemType': itemTypeQuery}, function(err, documents){
      responseData.itemModels = documents ;
  }))
  .then( function(){
    res.status(200).send( {'responseData': responseData}); 
  });

});

module.exports = router;
