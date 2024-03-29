 export interface Match {
    HomeTeamName:string;
    AwayTeamName:string;
    SmarketsHomeOdds:number;
    SmarketsAwayOdds:number;
    B365HomeOdds:number;
    B365DrawOdds:number;
    B365AwayOdds:number;
    B365BTTSOdds:number;
    B365O25GoalsOdds:number;
    StartDateTime:Date;
    EpochTime:number;
    League:string;
    OccurrenceHome: number;
    OccurrenceAway:number;
    URLB365:string;
    URLSmarkets:string;
  }

  export interface Fixture {
    Home: string;
    Away: string;
    SMHome: number;
    SMAway: number;
    BHome: number;
    BDraw: number;
    BAway: number;
    BTTSOdds: number;
    B25GOdds: number;
    Details: Date;
    EpochTime:number;
    League: string;
    OccH: number;
    OccA: number;
    UrlB365: string;
    UrlSmarkets: string;
    HStatus: { notify: boolean; activeBet: boolean; ignore: boolean; };
    AStatus: { notify: boolean; activeBet: boolean; ignore: boolean; };
    PreviousB365HomeOdds:any[];
    PreviousB365AwayOdds:any[];
    isWatched: boolean;
    homeLayOddsFlicker: boolean;
    awayLayOddsFlicker: boolean;
    homeBackOddsFlicker: boolean;
    awayBackOddsFlicker: boolean;
  }



