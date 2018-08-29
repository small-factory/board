const mongoose = require('mongoose');


var realtorSchema = mongoose.Schema({
    group: Number,
    local: {
        email: String,
        password: String
    },
    name: String,
    phone: String,
    brokerageId: String,
    brokerageName: String
});
const Realtor = mongoose.model('Realtor', realtorSchema, 'users');



var brokerageSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    location: String
});
const Brokerage = mongoose.model('Brokerage', brokerageSchema, 'brokerages');


module.exports = {
    Realtor,
    Brokerage
}