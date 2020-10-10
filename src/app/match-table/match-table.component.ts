import {Component} from '@angular/core';
import {Match} from '../match/match.model';

export interface PeriodicElement {
  date: string;
  time: string;
  home: string;
  homeTwoUp: number;
  homeBackOdds: number;
  homeLayOdds: number;
  homeMatchR: number;
  homeReturn: number;
  away: string;
  awayTwoUp: number;
  awayBackOdds: number;
  awayLayOdds: number;
  awayMatchR: number;
  awayReturn: number;
}

const ELEMENT_DATA: PeriodicElement[] = [

  {date: 'Jan 02', time: '13:00', home: 'Chelsea', homeTwoUp: 1.20, homeBackOdds: 3.2, homeLayOdds: 2.2, homeMatchR: 1.1,homeReturn: 2.2, away: 'Liverpool', awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3, awayMatchR: 1.231, awayReturn: 2.2 },
  {date: 'Jan 02', time: '16:30', home: 'Liverpool', homeTwoUp: 1.20, homeBackOdds: 3.2, homeLayOdds: 2.2, homeMatchR: 1.1,homeReturn: 2.2, away: 'Preston', awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3, awayMatchR: 1.231, awayReturn: 2.2 },
  {date: 'Jan 01', time: '11:30', home: 'Manchester Utd.', homeTwoUp: 1.20, homeBackOdds: 3.2, homeLayOdds: 2.2, homeMatchR: 1.1,homeReturn: 2.2, away: 'Cardiff', awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3, awayMatchR: 1.231, awayReturn: 2.2 },
  {date: 'Jan 01', time: '13:30', home: 'QPR', homeTwoUp: 1.20, homeBackOdds: 3.2, homeLayOdds: 2.2, homeMatchR: 1.1,homeReturn: 2.2, away: 'Bournemouth', awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3, awayMatchR: 1.231, awayReturn: 2.2 },
  {date: 'Jan 01', time: '15:00', home: 'Luton', homeTwoUp: 1.20, homeBackOdds: 3.2, homeLayOdds: 2.2, homeMatchR: 1.1,homeReturn: 2.2, away: 'Blackburn', awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3, awayMatchR: 1.231, awayReturn: 2.2 },
  {date: 'Jan 01', time: '15:00', home: 'Stoke', homeTwoUp: 1.20, homeBackOdds: 3.2, homeLayOdds: 2.2, homeMatchR: 1.1,homeReturn: 2.2, away: 'Nottm Forest', awayTwoUp: 1.1, awayBackOdds: 1.1, awayLayOdds: 3.3, awayMatchR: 1.231, awayReturn: 2.2 },


];

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

    columnsToDisplay: string[] = this.displayedColumns.slice();
    matches: Match[] = [new Match('test',  'test', 'test',  1,  2,  3,  4,  5,  'test',  1,  2,  3,  4,  5)];
    data: Match[] = this.matches;
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
