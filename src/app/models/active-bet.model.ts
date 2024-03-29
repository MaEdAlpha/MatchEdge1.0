export interface ActiveBet {
  id:string;
  juId:string;
  created:number;
  fixture:string;
  selection:string;
  league:string;
  logo:string;
  matchDetail:number;
  stake:number;
  backOdd:number;
  layOdd:number;
  layStake:number;
  liability:number;
  ev:number;
  mr:number;
  sauce:number;
  fta:number;
  ql:number;
  roi:number;
  betState:boolean;
  occ:number;
  pl:number;
  comment:string;
  isSettled:boolean;
  isBrkzFTA: number;
}
