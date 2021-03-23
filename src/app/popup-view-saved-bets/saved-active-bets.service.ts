import { Injectable } from '@angular/core';
import { ActiveBet } from '../models/active-bet.model';

@Injectable({
  providedIn: 'root'
})
export class SavedActiveBetsService {

  sabArray: ActiveBet[] = []

  constructor() { }

  saveToActiveBets(sab: ActiveBet):void{
    this.sabArray.push(sab);
    console.log("Saved to Active Bets!");
    console.log(sab);
  }

  getSabList():any[] {
    return this.sabArray;
  }
}
