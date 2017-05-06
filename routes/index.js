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
    var selectedTablesItemsJSON = res.body['selectedTableItemsArrayJSON[]']; 
    var itemTableRelation = res.body['itemTableRelation'];

    for(let i = 0 ; i < selectedTablesItemsJSON.length ; i++){
      let selectedItem = selectedTablesItemsJSON[i] ;

      let modelName   = selectedItem['Model Name'];
      let modelAmount = selectedItem['Amount'];

      delete selectedItem['Model Name'];
      delete selectedItem['Amount']; 

      if(!selectedItem.id){
          var newItemModel = new ItemModelsSchema({'name': modelName,
                'amount': Number(modelAmount), 'itemTableRelation': itemTableRelation});

          if(Object.keys(selectedItem).length > 0)
            newItemModel['customFieldsInputs'] = selectedItem ;

          newItemModel.save()
          continue;
        }

        ItemModelsSchema.findById(selectedItem.id, function(err,doc){
            delete selectedItem.id ;

            doc.name = modelName ;
            doc.amount = modelAmount 
            doc.itemTableRelation = itemTableRelation;

            if(Object.keys(selectedItem).length > 0){
                doc.customFieldsInputs = selectedItem
            }

            doc.save();
        });

    }
    res.status(200);
    return;
});

router.post('/removeSelectedTableItems', function(res, req){
    var itemsToRemove = res.body['filteredTableItemsArrayJSON[]'];
    var itemTableRelation = res.body['itemTableRelation'];
 
    for(let i = 0 ; i < itemsToRemove.length ; i++){
      ItemModelsSchema.remove({'_id': itemsToRemove[i].id}, function(err){
        if(err) console.log(err);
      });
    }

    res.status(200);
});


// GET from the DB all the Item Models by using query search 
// @param req.query.itemId is a query in the url using ?itemType=...
router.get('/getItemModelsFromDB', function(req, res, next){
  var itemIdQuery = req.query.itemId ;
  var responseData = {};

  ItemSchema.findById(itemIdQuery, function(err, document){
      responseData['fields'] = document.tableFields ;
  }).exec()
  .then(ItemModelsSchema.find({'itemTableRelation': itemIdQuery}, function(err, documents){
      responseData['itemModels'] = documents ;
      if(err) console.log(err);
      console.log('------');
      console.log('1');
  }).exec()
  .then(function(){
      console.log('2');
      console.log('------');
      res.status(200).send( {'responseData': responseData}); 
  }));


});

module.exports = router;
