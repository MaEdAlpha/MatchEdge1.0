import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject, Observable, Subscription} from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class SavedActiveBetsService {

  sabArray: ActiveBet[] = [];
  sabArrayfromDB: ActiveBet[] = [];
  private activeBetSubject = new Subject<ActiveBet>();
  sabListChange = new EventEmitter<ActiveBet>();
  public sabUpdated = new Subject<any>();

  constructor(private http: HttpClient) { }

  getActiveBets(){
    //should be able to pass in userID to lookup all activeBets relative to the user
    this.http.get<{body:any[]}>("http://localhost:3000/api/user/sabs"
    )
    .pipe(map( (mappedSAB) => {
      return mappedSAB.body.map((sab) => {
                                                return {
                                                      id: sab._id,
                                                      created: sab.created,
                                                      fixture: sab.fixture,
                                                      selection: sab.selection,
                                                      logo: sab.logo,
                                                      matchDetail: sab.matchDetail,
                                                      stake: sab.stake,
                                                      backOdd: sab.backOdd,
                                                      layOdd: sab.layOdd,
                                                      layStake: sab.layStake,
                                                      liability: sab.liability,
                                                      ev: sab.ev,
                                                      mr: sab.mr,
                                                      sauce: sab.sauce,
                                                      fta: sab.fta,
                                                      ql: sab.ql,
                                                      roi: sab.roi,
                                                      betState:sab.betState,
                                                      occ: sab.occ,
                                                      pl: sab.pl,
                                                      comment: sab.comment,
                                                      isSettled: sab.isSettled,
                                                    };
                                                }
                                   );
    }))
    .subscribe( (savedActiveBets: any) => {

                                              console.log(savedActiveBets);
                                              this.sabArrayfromDB = savedActiveBets;
                                              this.sabUpdated.next(savedActiveBets);
                                            }
                                            );
  }

  getsabUpdatedListener(): Observable<any>{
    return this.sabUpdated.asObservable();
  }

  //Used strictly for Juicy. Creates a new SAB
  saveToActiveBets(sab: ActiveBet):void{
    //need to emit each update so it passes any new items to the components listening.

    // this.http.get("http://localhost:3000/api/user")
    //           .subscribe( responseData => {
      //                       console.log(responseData);
      // });

      this.http.post("http://localhost:3000/api/sab", sab)
      .subscribe( sabEntry => {
        console.log("POST CREATED!!!");
        console.log(sabEntry);
      });
      this.sabListChange.emit(sab);

      this.getActiveBets();

    //each post made, do you retrieve the id and update it in observable? i.e get response data and add into subject this.sabUpdated.next(sab.dataPostedToDB)?
  }

  deleteSAB():void{
    //pass UID to database and remove this SAB from db
  }

  updateSAB():void{
    //pass UID to database and update this SAB with new fields
  }



  updateActiveBets(sab:ActiveBet, isEdit: boolean):void{
    console.log("updated!");
    console.log(sab);

    if(isEdit){
      //PATCH http Request needed to DB.
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
    return this.sabArrayfromDB;
  }

  logSabList() {
    console.log(this.sabArrayfromDB);
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
