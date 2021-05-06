import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject, Observable, Subscription} from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';
import { map } from 'rxjs/operators'
import { UserPropertiesService } from './user-properties.service';

@Injectable({
  providedIn: 'root'
})
export class SavedActiveBetsService {

  sabArray: ActiveBet[] = [];
  sabArrayfromDB: ActiveBet[] = [];
  private activeBetSubject = new Subject<ActiveBet>();
  sabListChange = new EventEmitter<ActiveBet>();
  removeFromList = new EventEmitter<string>();
  public sabUpdated = new Subject<any>();

  constructor(private http: HttpClient, private userPropService: UserPropertiesService) { }

  getActiveBets(): ActiveBet[]{
    //should be able to pass in userID to lookup all activeBets relative to the user
    var customParams: HttpParams = new HttpParams().append('juId', this.userPropService.getUserId());
    console.log(customParams);

    this.http.get<{body:any[]}>("http://localhost:3000/api/sab/sabs",  {params:customParams})
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
                                              console.log("Retriveing all user SAB");

                                              console.log(savedActiveBets);
                                              this.sabArrayfromDB = savedActiveBets;
                                              this.sabUpdated.next(savedActiveBets);
                                            }
                                            );
    return this.sabArrayfromDB;
  }

  getsabUpdatedListener(): Observable<any>{
    return this.sabUpdated.asObservable();
  }

  //Used strictly for Juicy. Creates a new SAB
  saveToActiveBets(sab: ActiveBet){
      this.http.post("http://localhost:3000/api/sab", sab)
      .subscribe( (sabEntry: { _id:string}) => {
        sab.id = sabEntry._id;
      });
      this.sabListChange.emit(sab);

    //each post made, do you retrieve the id and update it in observable? i.e get response data and add into subject this.sabUpdated.next(sab.dataPostedToDB)?
  }

  patchToActiveBets(sab:ActiveBet){
    this.http.put("http://localhost:3000/api/sab/" + sab.id, sab)
    .subscribe( (sabEntry) => {
      console.log( sabEntry);

    });
  }

  deleteSAB(sabID:string){
    //pass UID to database and remove this SAB from db
    this.http.delete("http://localhost:3000/api/sab/" + sabID)
    .subscribe( (data: {deletedCount: number}) => {
      data.deletedCount == 1 ?  this.removeFromList.emit(sabID) : this.removeFromList.emit("Error");
    });
  }




  updateActiveBets(sab:ActiveBet, isEdit: boolean):void{

    if(isEdit){
      //PATCH http Request needed to DB.
      this.patchToActiveBets(sab);
      const updatedSab = this.sabArray.filter( savedBet => {
        if(savedBet.created == sab.created && savedBet.selection == sab.selection){
          savedBet = sab;

          return true
        }
      });
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
