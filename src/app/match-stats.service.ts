import { Injectable } from '@angular/core';
import { CalcSettingsService } from './calc-settings/calc-settings.service';
import { UserPropertiesService } from './user-properties.service';
import { JuicyMatch } from './juicy-match/juicy-match.model';

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
  private juicyMatch: JuicyMatch;

  constructor(private ups: UserPropertiesService, private calcSettingsService: CalcSettingsService) { }


  getMatchStats(match){
    //for home matches
    this.stake = this.calcSettingsService.getPrefferedStake(match.BHome);
    this.backOdds = match.BHome;
    this.layOdds = match.SMHome;
    this.layStake = +(this.backOdds / (this.layOdds * this.stake)).toFixed(2);
    this.liability = +((this.layOdds - 1 )* this.layStake).toFixed(2);
    this.ql = +(this.layStake - this.stake).toFixed(2);
    this.oneInXgames = 50; //TODO Update this to dynamic value
    this.ft = +(this.stake * (this.backOdds - 1) + this.layStake).toFixed(2);
    this.evTotal = +(this.ft + (this.ql * (this.oneInXgames - 1))).toFixed(2);
    this.evThisBet = +(this.evTotal/this.oneInXgames).toFixed(2);
    this.roi = +(this.evThisBet/this.stake).toFixed(2);
    this.mRating = +(this.backOdds * 100 / this.layOdds).toFixed(2);

    console.log(match.Home + ": stake: " + this.stake + " bOdds" + this.backOdds + " lay: " + this.layOdds + " layStake " + this.layStake + " liability" + this.liability + " ql " + this.ql + " oneInXgames " + this.oneInXgames + " ft " + this.ft + " evThisBet " + this.evThisBet + " " + this.stake + " ");

     if(this.evTotal < 0)
     {
        this.juicyMatch =  {
          EventStart: match.Details,
          Fixture: match.Home + " vs " + match.Away,
          Selection: match.Home,
          BackOdds: this.backOdds,
          LayOdds: this.layOdds,
          FTAround: this.ft,
          EVTotal: this.evTotal,
          EVthisBet: this.evThisBet,
          MatchRating: this.mRating,
          Liability: this.liability,
          QL: this.ql,
          ROI: this.roi
        }
        this.juicyMatches.push(this.juicyMatch);
     }
  }

  getJuicyMatches(){
    return this.juicyMatches;
  }
}
