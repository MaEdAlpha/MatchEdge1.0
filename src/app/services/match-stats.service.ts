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
  private updateMatchStats:MatchStats = {stake: 0, backOdds: 0, layOdds: 0, layStake: 0, liability: 0, ql: 0, occurence: 0, ft: 0, evTotal: 0, evThisBet: 0, roi:  0, mRating: 0, qlPercentage: 0};

  private allSingleMatches: JuicyMatch[]=[];
  private homeSelection: JuicyMatch;
  private awaySelection: JuicyMatch;
  private pairOfSingleMatches: JuicyMatch[]=[];
  private streamUpdateHomeSelection: JuicyMatch;
  private streamUpdateAwaySelection: JuicyMatch;

  constructor(private calcSettingsService: CalcSettingsService,  private notificationService: NotificationBoxService) {
  }

// Service that handles all calculations for match records. Creates a juicy object for both DB document and any incoming Stream data.
getMatchStats(match){

  //Separate Match data
    // Home
    this.homeMatchStats.stake = this.calcSettingsService.getPrefferedStake(match.BHome);
    this.homeMatchStats.backOdds = match.BHome;
    this.homeMatchStats.layOdds = match.SMHome;
    this.homeMatchStats.occurence = match.OccH;
    // Away
    this.awayMatchStats.stake = this.calcSettingsService.getPrefferedStake(match.BAway);
    this.awayMatchStats.backOdds = match.BAway;
    this.awayMatchStats.layOdds = match.SMAway;
    this.awayMatchStats.occurence = match.OccA;
    //Calcaulate Stats
    this.homeMatchStats = this.calculateMatchStats(this.homeMatchStats);
    this.awayMatchStats = this.calculateMatchStats(this.awayMatchStats);

    //console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");
    //Create Juicy Object
    this.homeSelection = MatchStatsService.createJuicyObject(match, this.homeMatchStats, 'home', false);
    this.awaySelection = MatchStatsService.createJuicyObject(match, this.awayMatchStats, 'away', false);

    //Add to singles matches array to return
    this.allSingleMatches.push(this.homeSelection);
    this.allSingleMatches.push(this.awaySelection);
  }

  updateSelection(selection:JuicyMatch){
    this.updateMatchStats.stake = this.calcSettingsService.getPrefferedStake(selection.BackOdds);
    this.updateMatchStats.backOdds = selection.BackOdds;
    this.updateMatchStats.layOdds = selection.LayOdds;
    this.updateMatchStats.occurence = selection.FTAround;

    this.updateMatchStats = this.calculateMatchStats(this.updateMatchStats);

    selection.EVTotal = this.updateMatchStats.evTotal;
    selection.EVthisBet = this.updateMatchStats.evThisBet;
    selection.FTAProfit = this.updateMatchStats.ft;
    selection.FTAround = this.updateMatchStats.occurence;
    selection.LayOdds = this.updateMatchStats.layOdds;
    selection.LayStake = this.updateMatchStats.layStake;
    selection.Liability = this.updateMatchStats.liability;
    selection.MatchRating = this.updateMatchStats.mRating;
    selection.QL = this.updateMatchStats.ql;
    selection.QLPercentage = this.updateMatchStats.qlPercentage;
    selection.ROI = this.updateMatchStats.roi;
    selection.Stake = this.updateMatchStats.stake;

    return selection;
  }

  //Used in JuicyMatch Handling Service: To process incoming data to the SelectionObject (single Match object).
  retrieveStreamData(streamObj, teamName:string): JuicyMatch{

    var juicyStreamBuild : JuicyMatch;

    if(streamObj.HomeTeamName == teamName){
        // Home
        this.homeMatchStats.stake = this.calcSettingsService.getPrefferedStake(streamObj.B365HomeOdds);
        this.homeMatchStats.backOdds = streamObj.B365HomeOdds;
        this.homeMatchStats.layOdds = streamObj.SmarketsHomeOdds;
        this.homeMatchStats.occurence = streamObj.OccurrenceHome;
        this.homeMatchStats = this.calculateMatchStats(this.homeMatchStats);
        juicyStreamBuild = MatchStatsService.createJuicyObject(streamObj, this.homeMatchStats, 'home', true);

    } else if (streamObj.AwayTeamName == teamName){
        // Calculate Away Juicy values
        this.awayMatchStats.stake = this.calcSettingsService.getPrefferedStake(streamObj.B365AwayOdds);
        this.awayMatchStats.backOdds = streamObj.B365AwayOdds;
        this.awayMatchStats.layOdds = streamObj.SmarketsAwayOdds;
        this.awayMatchStats.occurence = streamObj.OccurrenceAway;
        this.awayMatchStats = this.calculateMatchStats(this.awayMatchStats);

        //Create Juicy Object
        juicyStreamBuild = MatchStatsService.createJuicyObject(streamObj, this.awayMatchStats, 'away', true);
    }
        return juicyStreamBuild
  }

  getAllSingleMatches(){
    //console.log( this.allSingleMatches);
    return this.allSingleMatches;
  }

  getSelectionStatCalcs(_allMatches){

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


  static createJuicyObject(match: any, matchStat: MatchStats, isHome:string, isUpdatedValue: boolean): JuicyMatch {

    //isUpdatedValue = false for new Stream data and true for updating juicyMatchObject calcs or instantiating a new juicyMatchObject
    var juicyObject: JuicyMatch = {
      EventStart: isUpdatedValue ? match.StartDateTime : match.Details,
      EpochTime: isUpdatedValue ? match.unixDateTimestamp : match.EpochTime,
      Stake: matchStat.stake,
      LayStake: matchStat.layStake,
      Fixture: isUpdatedValue ? match.HomeTeamName + " vs " + match.AwayTeamName : match.Home + " vs " + match.Away,
      Selection: isUpdatedValue ? ( isHome == 'home' ? match.HomeTeamName : match.AwayTeamName ) : ( isHome == 'home' ? match.Home : match.Away ),
      League: match.League,
      BackOdds: isUpdatedValue ? ( isHome == 'home' ? match.B365HomeOdds : match.B365AwayOdds ) : matchStat.backOdds,
      LayOdds: isUpdatedValue ? ( isHome == 'home' ? match.SmarketsHomeOdds : match.SmarketsAwayOdds ) : matchStat.layOdds,
      FTAround: matchStat.occurence,
      FTAProfit: matchStat.ft,
      EVTotal: matchStat.evTotal,
      EVthisBet: matchStat.evThisBet,
      ReturnRating: 100, //TODO find this
      MatchRating: matchStat.mRating,
      Liability: matchStat.liability,
      QL: matchStat.ql,
      ROI: matchStat.roi,
      Logo: isUpdatedValue ? null : match.Home.toLowerCase().split(' ').join('-'),
      UrlB365: isUpdatedValue ? null : match.UrlB365,
      UrlSmarkets: isUpdatedValue ? null : match.UrlSmarkets,
      backIsUpdated: isUpdatedValue ? null:false,
      layIsUpdated: isUpdatedValue ? null:false,
      evIsUpdated: isUpdatedValue ? null:false,
      freezeUpdates: isUpdatedValue ? null:false,
      QLPercentage: matchStat.qlPercentage,
      b365oddsHCurr: match.B365HomeOdds,
      b365oddsDrawCurr: match.B365DrawOdds,
      b365oddsACurr: match.B365AwayOdds,
      b365HPrev: match.PreviousB365HomeOdds,
      b365APrev: match.PreviousB365AwayOdds,
      b365DrawPrev: 999,
      ignore: isUpdatedValue ? null : isHome == 'home' ? match.HStatus.ignore : match.AStatus.ignore,
      notify: isUpdatedValue ? null : true,
      activeBet: isUpdatedValue ? null : isHome == 'home' ? match.HStatus.activeBet : match.AStatus.activeBet,
      betState: isUpdatedValue ? null : true,
      inRange: isUpdatedValue ? null : false,
      isRedirected: isUpdatedValue ? null : 'No',
      isWatched: isUpdatedValue ? null : false,
      isJuicy: isUpdatedValue ? null : false,
      userAware: isUpdatedValue ? null : false,
    }
    //Debug juicy object
    // console.log("JUICYYYY Object created!");
    // console.log(juicyObject);


    return juicyObject;
  }
}
