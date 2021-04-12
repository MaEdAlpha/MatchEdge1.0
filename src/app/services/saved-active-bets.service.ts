import { EventEmitter, Injectable } from '@angular/core';
import { Subject, Observable} from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';

@Injectable({
  providedIn: 'root'
})
export class SavedActiveBetsService {

  sabArray: ActiveBet[] = []
  private activeBetSubject = new Subject<ActiveBet>();
  sabListChange = new EventEmitter<ActiveBet[]>();

  constructor() { }

  //Used strictly for Juicy. Creates a new SAB
  saveToActiveBets(sab: ActiveBet):void{
    //need to emit each update so it passes any new items to the components listening.
    this.sabArray.push(sab);
    this.sabListChange.emit(this.sabArray.slice());
  }

  updateActiveBets(sab:ActiveBet, isEdit: boolean):void{
    console.log("updated!");
    console.log(sab);

    if(isEdit){
      const updatedSab = this.sabArray.filter( savedBet => {
        if(savedBet.created == sab.created && savedBet.selection == sab.selection){
          savedBet = sab;
          return true
        }
      });
      console.log(updatedSab);
    }else {
      this.saveToActiveBets(sab);
    }
  }

  getSabListObservable(): Observable<ActiveBet> {
    return this.activeBetSubject.asObservable();
  }

  getSabList():ActiveBet[] {
    return this.sabArray;
  }
  getSelectionSAB(activeBet:ActiveBet): ActiveBet[] {
      const selectionSAB = this.sabArray.filter( sab => {
        if(activeBet.selection == sab.selection){
          return true
        }
      });

      return selectionSAB;
  }
}
