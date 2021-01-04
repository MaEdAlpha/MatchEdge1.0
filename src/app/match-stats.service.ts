import { Injectable, EventEmitter } from '@angular/core';
import { CalcSettingsService } from './calc-settings/calc-settings.service';
import { UserPropertiesService } from './user-properties.service';
import { JuicyMatch } from './juicy-match/juicy-match.model';
import { Observable, Subject, from } from "rxjs";

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

  private juicyMatches: JuicyMatch[] = [];
  private singleHomeMatch: any;
  private singleAwayMatch: any;
  private allSingleMatches: any=[];
  private pairOfSingleMatches: any=[];



  constructor(private calcSettingsService: CalcSettingsService) {
  }

//The first HTTP GET you requested  fucks up all the variable names... either map...or figure shit out

//used in juicy-match-model
getMatchStats(match){

  //separate each match into a single Match Object.
    //reset list
    //for home matches
    this.stake = this.calcSettingsService.getPrefferedStake(match.BHome);
    this.backOdds = match.BHome;
    this.layOdds = match.SMHome;
    this.layStake = +(this.backOdds / this.layOdds * this.stake).toFixed(2);
    this.liability = +((this.layOdds - 1 )* this.layStake).toFixed(2);
    this.ql = +(this.layStake - this.stake).toFixed(2);
    this.oneInXgames = match.OccH;
    this.ft = +(this.stake * (this.backOdds - 1) + this.layStake).toFixed(2);
    this.evTotal = +(this.ft + (this.ql * (this.oneInXgames - 1))).toFixed(2);
    this.evThisBet = +(this.evTotal/this.oneInXgames).toFixed(2);
    this.roi = +(this.evThisBet/this.stake).toFixed(2);
    this.mRating = +(this.backOdds * 100 / this.layOdds).toFixed(2);

    //console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");


        this.singleHomeMatch =  {
          EventStart: match.Details,
          Stake: this.stake,
          LayStake: this.layStake,
          Fixture: match.Home + " vs " + match.Away,
          Selection: match.Home,
          BackOdds: this.backOdds,
          LayOdds: this.layOdds,
          FTAround: match.OccH,
          FTAProfit: this.ft,
          EVTotal: this.evTotal,
          EVthisBet: this.evThisBet,
          ReturnRating: 100, //TODO find this
          MatchRating: this.mRating,
          Liability: this.liability,
          QL: this.ql,
          ROI: this.roi,
          Logo: match.Home.toLowerCase().split(' ').join('-'),
          UrlB365: match.UrlB365,
          UrlSmarkets: match.UrlSmarkets,
          backIsUpdated: false,
          layIsUpdated:false,
          evIsUpdated: false,
          b365oddsHCurr: match.B365HomeOdds,
          b365oddsDrawCurr: match.B365DrawOdds,
          b365oddsACurr: match.B365AwayOdds,
          b365HPrev: match.PreviousB365HomeOdds,
          b365APrev: match.PreviousB365AwayOdds,
          b365DrawPrev: 999,
        }
        this.allSingleMatches.push(this.singleHomeMatch);

        //for away matches
          this.stake = this.calcSettingsService.getPrefferedStake(match.BAway);
          this.backOdds = match.BAway;
          this.layOdds = match.SMAway;
          this.layStake = +(this.backOdds / this.layOdds * this.stake).toFixed(2);
          this.liability = +((this.layOdds - 1 )* this.layStake).toFixed(2);
          this.ql = +(this.layStake - this.stake).toFixed(2);
          this.oneInXgames = match.OccA;
          this.ft = +(this.stake * (this.backOdds - 1) + this.layStake).toFixed(2);
          this.evTotal = +(this.ft + (this.ql * (this.oneInXgames - 1))).toFixed(2);
          this.evThisBet = +(this.evTotal/this.oneInXgames).toFixed(2);
          this.roi = +(this.evThisBet/this.stake).toFixed(2);
          this.mRating = +(this.backOdds * 100 / this.layOdds).toFixed(2);

            //console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");

        this.singleAwayMatch =  {
          EventStart: match.Details,
          Stake: this.stake,
          LayStake: this.layStake,
          Fixture: match.Home + " vs " + match.Away,
          Selection: match.Away,
          BackOdds: this.backOdds,
          LayOdds: this.layOdds,
          FTAround: match.OccA,
          FTAProfit: this.ft,
          EVTotal: this.evTotal,
          EVthisBet: this.evThisBet,
          ReturnRating: 100, //TODO find this
          MatchRating: this.mRating,
          Liability: this.liability,
          QL: this.ql,
          ROI: this.roi,
          Logo: match.Away.toLowerCase().split(' ').join('-'),
          UrlB365: match.UrlB365,
          UrlSmarkets: match.UrlSmarkets,
          backIsUpdated: false,
          layIsUpdated:false,
          evIsUpdated: false,
          b365oddsHCurr: match.B365HomeOdds,
          b365oddsDrawCurr: match.B365DrawOdds,
          b365oddsACurr: match.B365AwayOdds,
          b365HPrev: match.PreviousB365HomeOdds,
          b365APrev: match.PreviousB365AwayOdds,
          b365DrawPrev: 999,
        }
        this.allSingleMatches.push(this.singleAwayMatch);
  }

  clear(){
    this.allSingleMatches = [];
    this.singleAwayMatch = [];
    this.singleHomeMatch = [];
  }

  //UGLY ASS CODE, need to fix this....
  //Used in JuicyMatch Handling Service: To process incoming data to the correct SINGLE match Object.
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

        //console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");
            this.singleHomeMatch =  {
              EventStart: streamObj.StartDateTime,
              Stake: this.stake,
              LayStake: this.layStake,
              Fixture: streamObj.HomeTeamName + " vs " + streamObj.AwayTeamName,
              Selection: streamObj.HomeTeamName,
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
              layIsUpdated:false,
              evIsUpdated:false,
              b365oddsHCurr: streamObj.B365HomeOdds,
              b365oddsDrawCurr: streamObj.B365DrawOdds,
              b365oddsACurr: streamObj.B365AwayOdds,
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

       //console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");
            this.singleAwayMatch =  {
              EventStart: streamObj.StartDateTime,
              Stake: this.stake,
              LayStake: this.layStake,
              Fixture: streamObj.HomeTeamName + " vs " + streamObj.AwayTeamName,
              Selection: streamObj.AwayTeamName,
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
              backIsUpdated: false,
              layIsUpdated:false,
              evIsUpdated:false,
              b365oddsHCurr: streamObj.B365HomeOdds,
              b365oddsDrawCurr: streamObj.B365DrawOdds,
              b365oddsACurr: streamObj.B365AwayOdds,
              b365HPrev: streamObj.PreviousB365HomeOdds,
              b365APrev: streamObj.PreviousB365AwayOdds,
              b365DrawPrev: 999,
            }
            this.pairOfSingleMatches.push(this.singleAwayMatch);

            return this.pairOfSingleMatches;
  }

  getAllSingleMatches(){
    return this.allSingleMatches;
  }

}
