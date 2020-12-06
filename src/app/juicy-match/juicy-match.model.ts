export interface JuicyMatch{
  EventStart: string;
  Stake: number;
  LayStake: number;
  Fixture: string;
  Selection: string;
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
  b365oddsHCurr: number;
  b365oddsHPrev: number;
  b365oddsACurr: number;
  b365oddsAPrev: number;
  b365oddsDrawPrev: number;
  b365oddsDrawCurr: number;
}