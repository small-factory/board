const mongoose = require('mongoose');


var realtorSchema = mongoose.Schema({
    group: Number,
    local: {
        email: String,
        password: String,
        name: String,
        phone: String,
        brokerageId: String,
        brokerageName: String
    }
    
});
const Realtor = mongoose.model('Realtor', realtorSchema, 'users');



var brokerageSchema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    location: String
});
const Brokerage = mongoose.model('Brokerage', brokerageSchema, 'brokerages');

var prospectSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    notes: String,
    companyName: String,
    realtorId: String,
    realtorName: String
}, { timestamps: true });
const Prospect = mongoose.model('Prospect', prospectSchema, 'prospects');

var groupSchema = mongoose.Schema({
    name: String,
    prospects: [],
    owner: String
    
}, { timestamps: true });
const Group = mongoose.model('Group', groupSchema, 'groups');

var actionSchema = mongoose.Schema({
    type: String,
    data: [],
    owner: String,
    email: String
    
}, { timestamps: true });
const Action = mongoose.model('Action', actionSchema, 'actions');

var campaignSchema = mongoose.Schema({
    name: String,
    steps: [],
    owner: String,
    email: String
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema, 'campaigns');


module.exports = {
    Realtor,
    Brokerage,
    Prospect,
    Group,
    Action,
    Campaign
}