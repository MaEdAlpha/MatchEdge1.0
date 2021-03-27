import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';
import { SavedActiveBetsService } from '../popup-view-saved-bets/saved-active-bets.service';

@Component({
  selector: 'app-popup-form-saved-bets',
  templateUrl: './popup-form-saved-bets.component.html',
  styleUrls: ['./popup-form-saved-bets.component.css']
})
export class PopupFormSavedBetsComponent implements OnInit {
  sabList: ActiveBet[]=[];
  sabControl = new FormControl();
  isEdit:boolean;
  dataSource: any;
  userInputSubject = new Subject<any>();
  formSubscription = new Subscription();


  sabFormValues: FormGroup;

  constructor(private chRef: ChangeDetectorRef, public dialogRef: MatDialogRef<PopupFormSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService, private fb: FormBuilder ) {
      console.log("In Form Saved List.");
      this.sabList = this.savedActiveBetService.getSelectionSAB(this.data.activeBet);
      this.isEdit = data.isEdit;
      this.createForm(data);
      console.log(this.sabFormValues.value.Stake);

      this.userInputSubject.next({

        stake: this.sabFormValues.get('Stake').value,

      });
     }

  private createForm(data: any) {
    return this.sabFormValues = this.fb.group({
      Stake:new FormControl(data.activeBet.stake),
      LayStake: new FormControl(data.activeBet.backOdd / data.activeBet.layOdd * data.activeBet.stake),
      BackOdds: new FormControl(data.activeBet.backOdd),
      LayOdds: new FormControl(data.activeBet.layOdd),
    });
  }

  ngOnInit(): void {
    this.formSubscription = this.userInputSubject.asObservable().subscribe( data => {
      this.testMethod(data);
    });
  }

  ngAfterViewInit(){
    this.chRef.detectChanges();
  }

  onNoClick():void {
    this.dialogRef.close();
  }

  getRealtimeUpdate(){
    return this.sabFormValues;
  }

  getLayStake(backOdds:number, layOdds:number, stake:number):string {
    var layStake:number = (+backOdds / +layOdds)* + stake;

    return layStake.toPrecision(2);
  }

  testMethod(data){
    console.log("Hllo: " + data);

  }

}
