import {Component} from '@angular/core';
import {Match} from '../match/match.model';



/**
 * @title Table dynamically changing the columns displayed
 */
@Component({
    selector: 'app-match-table',
    templateUrl: './match-table.component.html',
    styleUrls: ['./match-table.component.css']
  })
  export class MatchTableComponent {
    displayedColumns: string[] = ['date', 'time', 'home', 'homeTwoUp', 'homeBackOdds', 'homeLayOdds', 'homeMatchR', 'homeReturn', 'away', 'awayTwoUp', 'awayBackOdds', 'awayLayOdds', 'awayMatchR', 'awayReturn'];


  MatchDetails: Match[] = [

  new Match( 'Jan 02', '13:00', 'Test', 1.20, 3.2,  2.2,  1.1, 2.2,'Liverpool', 1.1,  1.1,  3.3,  1.231,  2.2),
  new Match('Jan 02','16:30',  'Liverpool',  1.20,  3.2,  2.2,  1.1, 2.2, 'Preston', 1.1,  1.1, 3.3, 1.231, 2.2),
  new Match('Jan 01','11:30',  'Manchester Utd.',  1.20,  3.2,  2.2,  1.1, 2.2, 'Cardiff', 1.1,  1.1, 3.3, 1.231, 2.2),
  new Match('Jan 01','13:30',  'QPR',  1.20,  3.2,  2.2, 1.1, 2.2,  'Bournemouth', 1.1,  1.1, 3.3, 1.231, 2.2),
  new Match('Jan 01','15:00',  'Luton',  1.20,  3.2,  2.2, 1.1, 2.2,  'Blackburn', 1.1,  1.1, 3.3, 1.231, 2.2),
  new Match('Jan 01','15:00',  'Stoke',  1.20, 3.2,  2.2, 1.1, 2.2,  'Nottm Forest', 1.1,  1.1, 3.3, 1.231, 2.2),
]

    columnsToDisplay: string[] = this.displayedColumns.slice();
    data: Match[] = this.MatchDetails;
    addColumn(){
      const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
      this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
    }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  shuffle() {
    let currentIndex = this.columnsToDisplay.length;
    while (0 !== currentIndex) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // Swap
      let temp = this.columnsToDisplay[currentIndex];
      this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
      this.columnsToDisplay[randomIndex] = temp;
    }
  }
}

















// import { Component } from '@angular/core';

// export interface PeriodicElement {
//   date: string;
//   time: string;
//   home: string;
//   homeTwoUp: number;
//   homeBackOdds: number;
//   homeLayOdds: number;
//   away: string;
//   awayTwoUp: number;
//   awayBackOdds: number;
//   awayLayOdds: number;
// }

// const ELEMENT_DATA: PeriodicElement[] = [
//   {date: "Jan 01", time: "16:00", home: "Chelsea", homeTwoUp: 1.2, homeBackOdds: 3.2, homeLayOdds: 2.2, away: "Liverpool", awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3},
//   {date: "Jan 01", time: "16:00", home: "Chelsea", homeTwoUp: 1.2, homeBackOdds: 3.2, homeLayOdds: 2.2, away: "Liverpool", awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3},
//   {date: "Jan 01", time: "16:00", home: "Chelsea", homeTwoUp: 1.2, homeBackOdds: 3.2, homeLayOdds: 2.2, away: "Liverpool", awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3},
//   {date: "Jan 01", time: "16:00", home: "Chelsea", homeTwoUp: 1.2, homeBackOdds: 3.2, homeLayOdds: 2.2, away: "Liverpool", awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3},
// ];

// @Component({
//   selector: 'app-match-table',
//   templateUrl: './match-table.component.html',
//   styleUrls: ['./match-table.component.css']
// })
// export class MatchTableComponent {
//   displayedColumns: string[] = [ 'date', 'time', 'Home', '2UpFTAOcc.', 'BackOdds', 'LayOdds', 'MatchRating', 'Return%', 'Away', '2UpFTAOcc.', 'BackOdds', 'LayOdds', 'MatchRating', 'Return'];
//   columnsToDisplay: string[] = this.displayedColumns.slice();
//   data: PeriodicElement[] = ELEMENT_DATA;


//   addColumn() {
//     const randomColumn = Math.floor(Math.random() * this.displayedColumns.length);
//     this.columnsToDisplay.push(this.displayedColumns[randomColumn]);
//   }

//   removeColumn() {
//     if (this.columnsToDisplay.length) {
//       this.columnsToDisplay.pop();
//     }
//   }

//   shuffle() {
//     let currentIndex = this.columnsToDisplay.length;
//     while (0 !== currentIndex) {
//       let randomIndex = Math.floor(Math.random() * currentIndex);
//       currentIndex -= 1;

//       // Swap
//       let temp = this.columnsToDisplay[currentIndex];
//       this.columnsToDisplay[currentIndex] = this.columnsToDisplay[randomIndex];
//       this.columnsToDisplay[randomIndex] = temp;
//     }
//   }
// }
