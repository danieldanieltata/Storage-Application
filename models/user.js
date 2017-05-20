var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var userSchema = new Schema({

    username: {type: String, required: true},
    password: {type: String, required: true},
    name    : {type: String, required: false}

}, {collection: 'User'});

// generating a hash password 
userSchema.methods.generateHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Checking if password is valid 
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.local.password);
};


module.exports = mongoose.model('User', userSchema);