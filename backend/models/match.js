const mongoose = require('mongoose');

//create schema

const matchSchema = mongoose.Schema({
    date: {String, required: true},
    time: {String, required: true},
    home: {String, required: true},
    homeTwoUp: {Number, required: true},
    homeBackOdds: {Number, required: true},
    homeLayOdds: {Number, required: true},
    homeMatchR: {Number, required: true},
    homeReturn: {Number, required: true},
    away: {String, required: true},
    awayTwoUp: {Number, required: true},
    awayBackOdds: {Number, required: true},
    awayLayOdds: {Number, required: true},
    awayMatchR: {Number, required: true},
    awayReturn: {Number, required: true}
});

//expot model
module.exports = mongoose.model('Match' , matchSchema);
