import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SavedActiveBetsService {

  sabArray: any[] = [
    {
      "HReturn": 202,
      "Home": "Blackpool",
      "Away": "Peterborough United",
      "AReturn": 101,
      "SMHome": 1,
      "SMAway": 1.7,
      "BHome": 1.75,
      "BDraw": 1.25,
      "BAway": 1.62,
      "BTTSOdds": 1.9,
      "B25GOdds": 1.15,
      "Details": "23/03/2021 19:00:00",
      "LocaleDate": "2021-03-23T19:00:00.000Z",
      "EpochTime": 1616526000,
      "League": "England League 1",
      "OccH": 59,
      "OccA": 59
    },
    {
      "HReturn": 202,
      "Home": "Blackpool",
      "Away": "Peterborough United",
      "AReturn": 101,
      "SMHome": 2.15,
      "SMAway": 2.7,
      "BHome": 2.75,
      "BDraw": 2.25,
      "BAway": 2.62,
      "BTTSOdds": 2.9,
      "B25GOdds": 2.15,
      "Details": "23/03/2021 19:00:00",
      "LocaleDate": "2021-03-23T19:00:00.000Z",
      "EpochTime": 1616526000,
      "League": "England League 1",
      "OccH": 59,
      "OccA": 59
    },
    {
      "HReturn": 202,
      "Home": "Blackpool",
      "Away": "Peterborough United",
      "AReturn": 101,
      "SMHome": 3.15,
      "SMAway": 3.7,
      "BHome": 3.75,
      "BDraw": 3.25,
      "BAway": 3.62,
      "BTTSOdds": 1.9,
      "B25GOdds": 2.15,
      "Details": "23/03/2021 19:00:00",
      "LocaleDate": "2021-03-23T19:00:00.000Z",
      "EpochTime": 1616526000,
      "League": "England League 1",
      "OccH": 59,
      "OccA": 59
    }
  ]

  constructor() { }

  saveToActiveBets(row:any):void{
    console.log("Saved to Active Bets!");
    console.log(row);

  }

  getSabList():any[] {
    return this.sabArray;
  }
}
