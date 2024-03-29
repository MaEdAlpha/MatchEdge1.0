import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject, Observable, Subscription} from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';
import { map } from 'rxjs/operators'
import { UserPropertiesService } from './user-properties.service';
import { environment as env } from '../../environments/environment.prod';

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
    console.log("Getting SAB of user");

    this.http.get<{body:any[]}>(env.serverUrl + "/api/sab/sabs", {params:customParams})
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
                                                      isBrkzFTA: sab.isBrkzFTA,
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

  //Used when first loading page
  getsabUpdatedListener(): Observable<any>{
    return this.sabUpdated.asObservable();
  }
  //used when a user saves an active bet. Should be called only if needed to populate client side afte Record Bet hits in Juicy.
  getSabListObservable(): Observable<ActiveBet> {
    return this.activeBetSubject.asObservable();
  }


  //Used strictly for Juicy. Creates a new SAB. Was causing double population errors in Popup-view. Need to validate the record somehow....
  saveToActiveBets(sab: ActiveBet){
    this.http.post(env.serverUrl + "/api/sab",sab)
    .subscribe( (sabEntry: { _id:string}) => {
        sab.id = sabEntry._id;
        return this.activeBetSubject.next(sab);
      });
  }


  patchToActiveBets(sab:ActiveBet){
    this.http.put(env.serverUrl + "/api/sab/"+ sab.id, sab)
    .subscribe( (sabEntry) => {
      console.log("Updated: " + sabEntry);
    });
  }

  deleteSAB(sabID:string){
    //pass UID to database and remove this SAB from db
    this.removeFromList.emit(sabID)
    this.http.delete(
      env.serverUrl + "/api/sab/"
      // "Jb-env.eba-e8kmprp8.us-east-2.elasticbeanstalk.com/api/sab"
      + sabID)
    .subscribe( (data: {deletedCount: number}) => {
      data.deletedCount == 1 ?  "" : this.removeFromList.emit("Error");
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
      //setStyling to show an update in SAB-view
    }else {
      this.saveToActiveBets(sab);
    }
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
