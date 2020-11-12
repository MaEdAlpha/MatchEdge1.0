const mongoose = require('mongoose');

//create schema

const matchSchema = mongoose.Schema({
  match: {
    HomeTeamName:{String},
    AwayTeamName:{String},
    SmarketsHomeOdds:{Number},
    SmarketsAwayOdds:{Number},
    B365HomeOdds:{Number},
    B365DrawOdds:{Number},
    B365AwayOdds:{Number},
    B365BTTSOdds:{Number},
    B365O25GoalsOdds:{Number},
    StartDateTime:{String},
    League:{String},
    OccurrenceHome: {Number},
    OccurrenceAway:{Number},
}}, {collection: 'matches'});

//export model
module.exports = mongoose.connection.model('match', matchSchema);


// RefTag:"Bayer Leverkusen Nice"
// HomeTeamName:"Bayer Leverkusen"
// AwayTeamName:"Nice"
// SmarketsHomeOdds:null
// SmarketsAwayOdds:null
// B365HomeOdds:1.61
// B365DrawOdds:4
// B365AwayOdds:5
// B365BTTSOdds:0
// B365O25GoalsOdds:0
// StartDateTime:0001-01-01T00:00:00.000+00:00
// League:"UEFA Europa League"
// OccurrenceHome:0
// OccurrenceAway:0
