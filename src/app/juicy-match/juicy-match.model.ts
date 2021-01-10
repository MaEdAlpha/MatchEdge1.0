export interface JuicyMatch{
  EventStart: string;
  Stake: number;
  LayStake: number;
  Fixture: string;
  Selection: string;
  League: string;
  BackOdds: number;
  DrawOdds: number;
  LayOdds: number;
  FTAround:number;
  FTAProfit: number;
  EVTotal: number;
  EVthisBet: number;
  ReturnRating: number;
  MatchRating: number;
  Liability: number;
  QL: number;
  ROI: number;
  Logo: string;
  UrlB365: string;
  UrlSmarkets: string;
  backIsUpdated: boolean;
  layIsUpdated: boolean;
  evIsUpdated: boolean;
  freezeUpdates: boolean;
  b365oddsHCurr: number;
  b365oddsDrawCurr: number;
  b365oddsACurr: number;
  b365oddsHPrev: number;
  b365oddsAPrev: number;
  b365DrawPrev: number;
  ignore:boolean;
  notify:boolean;
  activeBet:boolean;
  inRange:boolean;

}
