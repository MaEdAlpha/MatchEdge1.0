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
    League:string;
    OccurrenceHome: number;
    OccurrenceAway:number;
    URLB365:string;
    URLSmarkets:string;
  }

  export interface Fixture {
    HReturn: number;
    Home: string;
    Away: string;
    AReturn: number;
    SMHome: number;
    SMAway: number;
    BHome: number;
    BDraw: number;
    BAway: number;
    BTTSOdds: number;
    B25GOdds: number;
    Details: Date;
    League: string;
    OccH: number;
    OccA: number;
    UrlB365: string;
    UrlSmarkets: string;
    HStatus: { notify: boolean; activeBet: boolean; ignore: boolean; };
    AStatus: { notify: boolean; activeBet: boolean; ignore: boolean; };
    isWatched: boolean;
    }



