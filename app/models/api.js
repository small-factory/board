const mongoose = require('mongoose');


var userSchema = mongoose.Schema({
    group: Number,
    local: {
        email: String,
        password: String
    },
    name: String,
    district: String
});
const User1 = mongoose.model('User1', userSchema, 'users');


var projectSchema = mongoose.Schema({
    id: Number,
    category: String,
    pointValue: Number,
    name: String,
    image: String,
    description: String,
    file: String,
    type: String,
    size: Number,
    categories: [],
    science: Number,
    technology: Number,
    research: Number,
    engineering: Number,
    arts: Number,
    mathematics: Number,
    active: Number,
    standards:  []
});
const Project = mongoose.model('Project', projectSchema, 'projects');

<<<<<<< HEAD

=======
var campaignSchema = mongoose.Schema({
    name: String,
    steps: [],
    owner: String,
    email: String
    
}, { timestamps: true });
const Campaign = mongoose.model('Campaign', campaignSchema, 'campaigns');
>>>>>>> parent of ef5b596... cleanup and adding to scheduling


module.exports = {
    User1,
    Project
}