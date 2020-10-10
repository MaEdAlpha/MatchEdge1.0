export class Match{

  public date: string;
  public time: string;
  public home: string;
  public homeTwoUp: number;
  public homeBackOdds: number;
  public homeLayOdds: number;
  public homeMatchR: number;
  public homeReturn: number;
  public away: string;
  public awayTwoUp: number;
  public awayBackOdds: number;
  public awayLayOdds: number;
  public awayMatchR: number;
  public awayReturn: number;

  constructor(_date: string, _time: string, _home: string,_homeTwoUp: number, _homeBackOdds: number,_homeLayOdds: number, _homeMatchR: number, _homeReturn: number, _away: string, _awayTwoUp: number,_awayBackOdds: number, _awayLayOdds: number,_awayMatchR: number, _awayReturn: number)
    {
      this.date = _date;
      this.time = _time;
      this.home = _home;
      this.homeTwoUp = _homeTwoUp;
      this.homeBackOdds = _homeBackOdds;
      this.homeLayOdds = _homeLayOdds;
      this.homeMatchR = _homeMatchR;
      this.homeReturn = _homeReturn;
      this.away = _away;
      this.awayTwoUp = _awayTwoUp;
      this.awayBackOdds = _awayBackOdds;
      this.awayLayOdds = _awayLayOdds;
      this.awayMatchR = _awayMatchR;
      this.awayReturn = _awayReturn;
   }
}
//  export interface Matches {
//     date: string;
//     time: string;
//     home: string;
//     homeTwoUp: number;
//     homeBackOdds: number;
//     homeLayOdds: number;
//     homeMatchR: number;
//     homeReturn: number;
//     away: string;
//     awayTwoUp: number;
//     awayBackOdds: number;
//     awayLayOdds: number;
//     awayMatchR: number;
//     awayReturn: number;
//   }

// }
