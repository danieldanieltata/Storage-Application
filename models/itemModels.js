var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Setting the model of all the Items Models 
var itemModelSchema = new Schema({
    name: {type: String, required: true},
    amount: {type: Number, required: true},
    itemTableRelation: {type: String, required: true},
    date: {type: Date, required: true, default: Date.now},
    customFieldsInputs: {type: Array, required: true}
}, {collection: 'ItemModel'});

module.exports = mongoose.model('ItemModelsModel', itemModelSchema);

