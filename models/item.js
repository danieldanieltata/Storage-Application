var mongoose = require('mongoose');
var Scheama = mongoose.Schema;

var ItemModel = new Scheama({
    name: {type: String, required: true},
    tableFields: {type: Array, required: true}
});

module.exports = mongoose.model('ItemModel', ItemModel);