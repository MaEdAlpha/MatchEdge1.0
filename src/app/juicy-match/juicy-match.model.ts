export interface JuicyMatch{
  EventStart: string;
  EpochTime: number;
  Stake: number;
  LayStake: number;
  Fixture: string;
  Selection: string;
  League: string;
  BackOdds: number;
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
  QLPercentage: number;
  b365oddsHCurr: number;
  b365oddsDrawCurr: number;
  b365oddsACurr: number;
  b365HPrev: number;
  b365APrev: number;
  b365DrawPrev: number;
  ignore:boolean;
  notify:boolean;
  activeBet:boolean;
  betState:boolean;
  inRange:boolean;
  isRedirected:string;
}

export interface MatchStats{
  stake:number;
  backOdds:number;
  layOdds:number;
  layStake:number;
  liability:number;
  ql:number;
  occurence:number;
  ft:number;
  evTotal:number;
  evThisBet:number;
  roi: number;
  mRating:number;
  qlPercentage:number;
}
