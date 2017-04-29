var mongoose = require('mongoose');
var Scheama = mongoose.Schema;

var ItemModel = new Scheama({
    name: {type: String, required: true},
    tableFields: {type: Array, required: true},
    itemModelsCount: {type: Number, required: false, default:0}
}, {collection: 'Items'});

module.exports = mongoose.model('ItemModel', ItemModel);