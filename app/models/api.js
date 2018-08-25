const mongoose = require('mongoose');


var realtorSchema = mongoose.Schema({
    group: Number,
    local: {
        email: String,
        password: String
    },
    name: String,
    phone: String
});
const Realtor = mongoose.model('Realtor', realtorSchema, 'users');


module.exports = {
    Realtor
}