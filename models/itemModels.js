var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Setting the model of all the Items Models 
var itemModelSchema = new Schema({
    name: {type: String, required: true},
    amount: {type: Number, required: true},
    itemType: {type: String, required: true},
    date: {type: Date, required: true, default: Date.now},
    customFields: {type: Array, required: false, default: []},
}, {collection: 'ItemModel'});

module.exports = mongoose.model('ItemModel', itemModelSchema);

