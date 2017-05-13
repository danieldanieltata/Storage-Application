var express = require('express');
var mongoose = require('mongoose');

var ItemSchema = require('../models/item.js');
var ItemModelsSchema = require('../models/itemModels.js');

var router = express.Router();
var os = require("os");
console.log(os.userInfo());



/* GET home page. 
   getting the homepage data, finding the Items from DB
*/
router.get('/', function(req, res, next) {

  ItemSchema.find({}).then(function(documents){
    res.render('index', {itemsList: documents});
  });

});

/* POST add Item to items ist
  This func will handle the items that the users want to add

  @param newItem -> Handles the new Item that the user wants to add
  @param item    -> Handles the ItemSchema, all the vars that required to add new item
*/ 
router.post('/postNewItemToDB', function(req, res){
    var newItem = {name: req.body['name'], tableFields: req.body['tablesFields[]']};
    
    var item = new ItemSchema(newItem);

    ItemSchema.find({name: newItem.name}).count(function(err, count){
        if(count > 0){
          res.status(200).json({'done': false, 'err': 'This item is already exists'});
          return ;
        }

        item.save().then(function(){
          res.status(200).json({'done': true, 'err': err});
          return;
        });

    });

    return;
});



/* POST handles the updatesof rows and new rows
   This function will handles all the thing that need to happend when the user wants to make changes in table

   @param selectedTablesItemsJSON         -> Handles the selected items JSON Array
   @param itemTableRelation               -> Handles the item table models relation 
   @param promissedUpdatingSelectedItem   -> Making a promise obj in order to make things step by step
   @param countSelectedItemsThatAddedToDB -> Counting obj that have been updated in order to indicate when done
   @param selectedItem                    -> Handles sing selected item 
   @param modelName                       -> Handles the name of the model selected
   @param modelAmount                     -> Handles the model amount 
   @param newItemModel                    -> If item is new making a new itemModel obj and saving 
                                             If item exists then updating him.
*/ 
router.post('/addOrUpdateSelectedTableItems', function(req, res){
    var selectedTablesItemsJSON = req.body['selectedTableItemsArrayJSON[]']; 
    var itemTableRelation = req.body['itemTableRelation'];
    
    var promissedUpdatingSelectedItem = new Promise(function(resolve, reject){

        let countSelectedItemsThatAddedToDB = 0;
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

              newItemModel.save();

              countSelectedItemsThatAddedToDB++;
              if(selectedTablesItemsJSON.length === countSelectedItemsThatAddedToDB){
                resolve({'done': true, 'err': null});
                continue;
              }

            }

            else{
                ItemModelsSchema.findById(selectedItem.id, function(err,doc){
                    if(err){
                      reject({'done': false, 'err': err});
                      return;
                    }

                    delete selectedItem.id ;

                    doc.name = modelName ;
                    doc.amount = modelAmount 
                    doc.itemTableRelation = itemTableRelation;

                    if(Object.keys(selectedItem).length > 0){
                        doc.customFieldsInputs = selectedItem
                    }

                    doc.save().then(function(){
                          countSelectedItemsThatAddedToDB++;
                          if(selectedTablesItemsJSON.length === countSelectedItemsThatAddedToDB){
                            resolve({'done': true, 'err': err});
                            return;
                          }
                    });

                });
            } // end Else
        } // End of For Loop

    }); // End of Promise 


    promissedUpdatingSelectedItem.then(function(status){

        if(status.done === true){
          res.status(200).json(status);
          return;
        }

    },function(status){

      res.status(500);
      console.log(status);
      return;

    });

    return;
});

/*
    GET remove items
    This GET function will handle a request to remove table rows from the DB

    @param itemsToRemove         -> Handles the items that we want to remove, getting this from frontend
    @param itemTableRelation     -> Handles the Item Model Rows relation to the Items ex: Switch relation is 3750
    @param itemsToRemoveCount    -> Counts the items that have been removed 
    @param promissedRemoveFromDB -> Doing the removing proccess step by step 
*/
router.post('/removeSelectedTableItems', function(req, res){
    var itemsToRemove = req.body['filteredTableItemsArrayJSON[]'];
    var itemTableRelation = req.body['itemTableRelation'];
 
    let itemsToRemoveCount = 0; 
    var promissedRemoveFromDB = new Promise(function(resolve, reject){
        for(let i = 0 ; i < itemsToRemove.length ; i++){
          
          ItemModelsSchema.remove({'_id': itemsToRemove[i].id}, function(err){
              if(err){
                  console.log(err);
                  reject({'done': false, 'err': err});
                  return;
              }
              else{
                  itemsToRemoveCount++;
                  if(itemsToRemoveCount === itemsToRemove.length) {
                    resolve({'done': true, 'err': err});
                    return;
                  }          
              }

          }); // End of DB remove 

        } // End of For Lopp 

    });

    promissedRemoveFromDB.then(function(status){
        if(status.done === true) res.status(200).json(status);
        return;
    },
    function(status){
        if(status.done === false) res.status(500).json(status);
        return;
    });
    
    return; 
});


/*  POST update amount of items
    This POST function handles the updating of the amount users are taking.

    @param itemsToUpdateArray          -> Handles the items that we want to update, from the frontend
    @param new Promise                 -> Making a new Promise obj in order to first update the amounts and then keep going
    @param countItems                  -> Handles the count of items, having this in order to check if we can resolve
    @param amountUserTook, itemModelID -> This two vars taking the amount and the item model from the frontend request
    @param status                      -> Handles a boolean var that indicates us if the updating progress is OK or NOT
*/
router.post('/updateAmountOfModels', function(req, res){
    var itemsToUpdateArray = req.body['itemsToUpdateArray[]'];

    new Promise(function(resolve, reject){
        let countItems = 0; 

        for(let i = 0 ; i < itemsToUpdateArray.length ; i++){
          let amountUserTook  = itemsToUpdateArray[i].inputValue;
          let itemModelID = itemsToUpdateArray[i].parentID;

          ItemModelsSchema.findById(itemModelID, function(err, document){
            if(document.amount < amountUserTook){
              reject(false);
              return;
            }

            document.amount -= amountUserTook;

            document.save().then(function(){
              countItems++ ;
              if(countItems === itemsToUpdateArray.length) resolve(true);
            });

          }).exec();

      } // End of For Loop

  }) // End of Promise 
    .then(function(status){

      if(status === true)
        res.status(200).json( {'done': true, 'err': null} );  
        return;
    }, 
    function(status){

      if(status === false)
        res.status(500).json( {'done': false, 'err': 'Some of the amounts are wrong ;('} );
        return; 
    });
    
});

/* GET from the DB all the Item Models by using query search
   This func will send to the frontend the Item Models data that needed.

   @param itemIdQuery  -> Handles the id query that the frontend send
   @param responseData -> Handles the data that we want to send to frontend
   @param new Promise  -> Making a new Promise obj 
   @param status       -> Handles the result of the promise that we made 
*/
router.get('/getItemModelsFromDB', function(req, res, next){
  var itemIdQuery = req.query.itemId ;
  var responseData = {};

    new Promise(function(resolve, reject){
        ItemSchema.findById(itemIdQuery, function(err, document){
            if(err) reject({'err': err});

            responseData['fields'] = document.tableFields ;

            ItemModelsSchema.find({'itemTableRelation': itemIdQuery}, function(err, documents){
                if(documents){
                  responseData['itemModels'] = documents ;
                  resolve({'done': true, 'err': err});
                }
                else
                  reject({'done': false, 'err': err});
        
            }).exec();

        }).exec();

    }).then(function(status){

      if(status.done === true)
        res.status(200).json({'responseData': responseData});
        return;
    }, function(status){

      res.status(500);
      console.log(status.err);
      return;
    }); 

    return;
});

module.exports = router;
