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

   // {"_id":{"$binary":{"base64":"T3NkozjVFkykpMFeCgKhTw==","subType":"03"}},"RefTag":"Bayer Leverkusen Nice","HomeTeamName":"Bayer Leverkusen","AwayTeamName":"Nice","SmarketsHomeOdds":null,"SmarketsAwayOdds":null,"B365HomeOdds":{"$numberDouble":"1.61"},"B365DrawOdds":{"$numberDouble":"4"},"B365AwayOdds":{"$numberDouble":"5"},"B365BTTSOdds":{"$numberDouble":"0"},"B365O25GoalsOdds":{"$numberDouble":"0"},"StartDateTime":{"$date":{"$numberLong":"-62135596800000"}},"League":"UEFA Europa League","OccurrenceHome":{"$numberDouble":"0"},"OccurrenceAway":{"$numberDouble":"0"}}
});

//export model
module.exports = mongoose.model('Match' , matchSchema);
