import { Injectable, EventEmitter } from '@angular/core';
import { CalcSettingsService } from '../calc-settings/calc-settings.service';
import { UserPropertiesService } from './user-properties.service';
import { JuicyMatch, MatchStats } from '../juicy-match/juicy-match.model';
import { Match } from '../match/match.model';
import { Observable, Subject, from } from "rxjs";
import { NotificationBoxService } from './notification-box.service';
import { MatchStatusService } from './match-status.service';

@Injectable({
  providedIn: 'root'
})

export class MatchStatsService {
  stake:number;
  backOdds:number;
  layOdds:number;
  layStake:number;
  liability:number;
  ql:number;
  oneInXgames:number;
  ft:number;
  evTotal:number;
  evThisBet:number;
  roi: number;
  mRating:number;
  qlPercentage:number;

  private homeMatchStats:MatchStats = {stake: 0, backOdds: 0, layOdds: 0, layStake: 0, liability: 0, ql: 0, occurence: 0, ft: 0, evTotal: 0, evThisBet: 0, roi:  0, mRating: 0, qlPercentage: 0};
  private awayMatchStats:MatchStats = {stake: 0, backOdds: 0, layOdds: 0, layStake: 0, liability: 0, ql: 0, occurence: 0, ft: 0, evTotal: 0, evThisBet: 0, roi:  0, mRating: 0, qlPercentage: 0};


  private juicyMatches: JuicyMatch[] = [];
  private singleHomeMatch: any;
  private singleAwayMatch: any;
  private allSingleMatches: JuicyMatch[]=[];
  private pairOfSingleMatches: any=[];
  private preferredHomeStake: number;
  private preferredAwayStake: number;



  constructor(private calcSettingsService: CalcSettingsService,  private notificationService: NotificationBoxService) {
  }

//The first HTTP GET you requested  fucks up all the variable names... either map...or figure shit out

//used in juicy-match-model INITALIZATION. DIFFERENT FROM retrieveStreamData(). Non DB saved variables attached here.
getMatchStats(match){

  //declare match stake, back and lay odds and occurence. Then retrieve calculated odds.
    this.homeMatchStats.stake = this.calcSettingsService.getPrefferedStake(match.BHome);
    this.homeMatchStats.backOdds = match.BHome;
    this.homeMatchStats.layOdds = match.SMHome;
    this.homeMatchStats.occurence = match.OccH;

    this.awayMatchStats.stake = this.calcSettingsService.getPrefferedStake(match.BAway);
    this.awayMatchStats.backOdds = match.BAway;
    this.awayMatchStats.layOdds = match.SMAway;
    this.awayMatchStats.occurence = match.OccA;

    this.homeMatchStats = this.calculateMatchStats(this.homeMatchStats);
    this.awayMatchStats = this.calculateMatchStats(this.awayMatchStats);

    //console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");

    this.singleHomeMatch = MatchStatsService.createJuicyObject(match, this.homeMatchStats);
    this.singleAwayMatch = MatchStatsService.createJuicyObject(match, this.awayMatchStats);

    //Add to singles matches array to return
    this.allSingleMatches.push(this.singleHomeMatch);
    this.allSingleMatches.push(this.singleAwayMatch);

    console.log(this.allSingleMatches);

  }


  //Used in JuicyMatch Handling Service: To process incoming data to the SelectionObject (single Match object).
  retrieveStreamData(streamObj){
        this.pairOfSingleMatches = [];
        //for home matches
        this.stake = this.calcSettingsService.getPrefferedStake(streamObj.B365HomeOdds);
        this.backOdds = streamObj.B365HomeOdds;
        this.layOdds = streamObj.SmarketsHomeOdds;
        this.layStake = +(this.backOdds / this.layOdds * this.stake).toFixed(2);
        this.liability = +((this.layOdds - 1 )* this.layStake).toFixed(2);
        this.ql = +(this.layStake - this.stake).toFixed(2);
        this.oneInXgames = streamObj.OccurrenceHome;
        this.ft = +(this.stake * (this.backOdds - 1) + this.layStake).toFixed(2);
        this.evTotal = +(this.ft + (this.ql * (this.oneInXgames - 1))).toFixed(2);
        this.evThisBet = +(this.evTotal/this.oneInXgames).toFixed(2);
        this.roi = +(this.evThisBet/this.stake).toFixed(2);
        this.mRating = +(this.backOdds * 100 / this.layOdds).toFixed(2);
        this.qlPercentage = +(this.ql/this.ft*100).toFixed(2);
        //console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");
            this.singleHomeMatch =  {
              EventStart: streamObj.StartDateTime,
              EpochTime: streamObj.unixDateTimestamp,
              Stake: this.stake,
              LayStake: this.layStake,
              Fixture: streamObj.HomeTeamName + " vs " + streamObj.AwayTeamName,
              Selection: streamObj.HomeTeamName,
              League: streamObj.League,
              BackOdds: this.backOdds,
              LayOdds: this.layOdds,
              FTAround: streamObj.OccurrenceHome,
              FTAProfit: this.ft,
              EVTotal: this.evTotal,
              EVthisBet: this.evThisBet,
              ReturnRating: 100, //TODO find this
              MatchRating: this.mRating,
              Liability: this.liability,
              QL: this.ql,
              ROI: this.roi,
              Logo: streamObj.HomeTeamName.toLowerCase().split(' ').join('-'),
              UrlB365: streamObj.UrlB365,
              UrlSmarkets: streamObj.UrlSmarkets,
              backIsUpdated: false,
              layIsUpdated: false,
              evIsUpdated: false,
              freezeUpdates: false,
              b365oddsHCurr: streamObj.B365HomeOdds,
              b365oddsDrawCurr: streamObj.B365DrawOdds,
              b365oddsACurr: streamObj.B365AwayOdds,
              QLPercentage: this.qlPercentage,
              b365HPrev: streamObj.PreviousB365HomeOdds,
              b365APrev: streamObj.PreviousB365AwayOdds,
              b365DrawPrev: 999,
            }
            this.pairOfSingleMatches.push(this.singleHomeMatch);

            //for away matches
        this.stake = this.calcSettingsService.getPrefferedStake(streamObj.B365AwayOdds);
        this.backOdds = streamObj.B365AwayOdds;
        this.layOdds = streamObj.SmarketsAwayOdds;
        this.layStake = +(this.backOdds / this.layOdds * this.stake).toFixed(2);
        this.liability = +((this.layOdds - 1 )* this.layStake).toFixed(2);
        this.ql = +(this.layStake - this.stake).toFixed(2);
        this.oneInXgames = streamObj.OccurrenceAway;
        this.ft = +(this.stake * (this.backOdds - 1) + this.layStake).toFixed(2);
        this.evTotal = +(this.ft + (this.ql * (this.oneInXgames - 1))).toFixed(2);
        this.evThisBet = +(this.evTotal/this.oneInXgames).toFixed(2);
        this.roi = +(this.evThisBet/this.stake).toFixed(2);
        this.mRating = +(this.backOdds * 100 / this.layOdds).toFixed(2);
        this.qlPercentage = +(this.ql/this.ft*100).toFixed(2);
       //console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");
            this.singleAwayMatch =  {
              EventStart: streamObj.StartDateTime,
              EpochTime: streamObj.unixDateTimestamp,
              Stake: this.stake,
              LayStake: this.layStake,
              Fixture: streamObj.HomeTeamName + " vs " + streamObj.AwayTeamName,
              Selection: streamObj.AwayTeamName,
              League: streamObj.League,
              BackOdds: this.backOdds,
              LayOdds: this.layOdds,
              FTAround: streamObj.OccurrenceAway,
              FTAProfit: this.ft,
              EVTotal: this.evTotal,
              EVthisBet: this.evThisBet,
              ReturnRating: 100, //TODO find this
              MatchRating: this.mRating,
              Liability: this.liability,
              QL: this.ql,
              ROI: this.roi,
              Logo: streamObj.AwayTeamName.toLowerCase().split(' ').join('-'),
              UrlB365: streamObj.UrlB365,
              UrlSmarkets: streamObj.UrlSmarkets,
              backIsUpdated: true,
              layIsUpdated: true,
              evIsUpdated: true,
              freezeUpdates: false,
              // b365oddsHCurr: streamObj.B365HomeOdds,
              // b365oddsDrawCurr: streamObj.B365DrawOdds,
              // b365oddsACurr: streamObj.B365AwayOdds,
              QLPercentage: this.qlPercentage,
              b365HPrev: streamObj.PreviousB365HomeOdds,
              b365APrev: streamObj.PreviousB365AwayOdds,
              b365DrawPrev: 999,
            }
            this.pairOfSingleMatches.push(this.singleAwayMatch);
            //retrieve boolean to see if selections are already in JuicyMathTable
            this.notificationService.showJuicyNotification(this.pairOfSingleMatches);
            return this.pairOfSingleMatches;
  }

  getAllSingleMatches(){
    //console.log( this.allSingleMatches);

    return this.allSingleMatches;
  }

  getSingleMatches(_allMatches){

    if(_allMatches != undefined){
      _allMatches.forEach((match) => {
        this.getMatchStats(match); //Parses match Fixture into Selections.
      });
      return this.getAllSingleMatches();
    } else  {
      console.log("Matches List is empty!");
    }
  }


  calculateMatchStats(match: MatchStats):MatchStats{

    var stake = match.stake;
    var backOdds = match.backOdds;
    var layOdds = match.layOdds;
    var occurence = match.occurence;

    match.layStake = +(backOdds / layOdds * stake).toFixed(2);
    match.liability = +((layOdds - 1 )* match.layStake).toFixed(2);
    match.ql = +(match.layStake - stake).toFixed(2);
    match.ft = +(stake * (backOdds - 1) + match.layStake).toFixed(2);
    match.evTotal = +(match.ft + (match.ql * (occurence - 1))).toFixed(2);
    match.evThisBet = +(match.evTotal/occurence).toFixed(2);
    match.roi = +(match.evThisBet/stake).toFixed(2);
    match.mRating = +(backOdds * 100 / layOdds).toFixed(2);
    match.qlPercentage = +(match.ql/match.ft*100).toFixed(2);

    return match;
  }


  static createJuicyObject(match: any, matchStat: MatchStats): JuicyMatch {
    var juicyObject: JuicyMatch = {
      EventStart: match.Details,
      EpochTime: match.EpochTime,
      Stake: matchStat.stake,
      LayStake: matchStat.layStake,
      Fixture: match.Home + " vs " + match.Away,
      Selection: match.Home,
      League: match.League,
      BackOdds: matchStat.backOdds,
      LayOdds: matchStat.layOdds,
      FTAround:matchStat.occurence,
      FTAProfit: matchStat.ft,
      EVTotal: matchStat.evTotal,
      EVthisBet: matchStat.evThisBet,
      ReturnRating: 100, //TODO find this
      MatchRating: matchStat.mRating,
      Liability: matchStat.liability,
      QL: matchStat.ql,
      ROI: matchStat.roi,
      Logo: match.Home.toLowerCase().split(' ').join('-'),
      UrlB365: match.UrlB365,
      UrlSmarkets: match.UrlSmarkets,
      backIsUpdated: false,
      layIsUpdated:false,
      evIsUpdated: false,
      freezeUpdates: false,
      QLPercentage: matchStat.qlPercentage,
      b365oddsHCurr: match.B365HomeOdds,
      b365oddsDrawCurr: match.B365DrawOdds,
      b365oddsACurr: match.B365AwayOdds,
      b365HPrev: match.PreviousB365HomeOdds,
      b365APrev: match.PreviousB365AwayOdds,
      b365DrawPrev: 999,
      ignore: match.HStatus.ignore,
      notify: true,
      activeBet: match.HStatus.activeBet,
      betState: true,
      inRange: false,
      isRedirected:'No',
    }

    return juicyObject;
  }
}
