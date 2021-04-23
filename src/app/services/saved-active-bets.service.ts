import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject, Observable} from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class SavedActiveBetsService {

  sabArray: ActiveBet[] = []
  private activeBetSubject = new Subject<ActiveBet>();
  sabListChange = new EventEmitter<ActiveBet[]>();

  constructor(private http: HttpClient) { }

  //Used strictly for Juicy. Creates a new SAB
  saveToActiveBets(sab: ActiveBet):void{
    //need to emit each update so it passes any new items to the components listening.
    this.sabArray.push(sab);
    this.sabListChange.emit(this.sabArray.slice());
    this.http.get("http://localhost:3000/api/user")
              .subscribe( responseData => {
                          console.log(responseData);
    });

    this.http.post("http://localhost:3000/api/sab", sab)
              .subscribe( sabEntry => {
                console.log(sabEntry);
              });
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
