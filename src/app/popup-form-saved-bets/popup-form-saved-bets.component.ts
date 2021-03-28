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
  isEarlyCashout:boolean;
  sabFormValues: FormGroup;

  constructor(private chRef: ChangeDetectorRef, public dialogRef: MatDialogRef<PopupFormSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService, private fb: FormBuilder ) {
      console.log("In Form Saved List.");
      this.sabList = this.savedActiveBetService.getSelectionSAB(this.data.activeBet);
      this.isEdit = data.isEdit;
      this.isEarlyCashout=false;
      this.createForm(data);
      console.log(this.sabFormValues.value.Stake);
     }

  private createForm(data: any) {
    return this.sabFormValues = this.fb.group({
      Stake:new FormControl(data.activeBet.stake),
      LayStake: new FormControl((data.activeBet.backOdd / data.activeBet.layOdd * data.activeBet.stake).toPrecision(2)),
      BackOdds: new FormControl(data.activeBet.backOdd),
      LayOdds: new FormControl(data.activeBet.layOdd),
      Liability: new FormControl(data.activeBet.liability),
      QL: new FormControl(data.activeBet.ql),
      EstValue: new FormControl(data.activeBet.ev),
      FTA: new FormControl(data.activeBet.fta),
      ROI: new FormControl(data.activeBet.roi),
      BetState: new FormControl(data.activeBet.isMatched),
      PL: new FormControl(data.activeBet.pl),
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.chRef.detectChanges();
  }

  onNoClick():void {
    this.dialogRef.close();
  }

  updateForm():void {
    console.log(this.sabFormValues);

  }

  getRealtimeUpdate(){
    return this.sabFormValues;
  }

  getLayStake(backOdds:number, layOdds:number, stake:number):string {
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    this.sabFormValues.get('LayStake').setValue(layStake.toFixed(2));
    return layStake.toFixed(2);
  }

  getLiability(backOdds:number, layOdds:number, stake:number ):string{
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    var liability = (layOdds - 1) * layStake;
    this.sabFormValues.get('Liability').setValue(liability.toFixed(2));
    return liability.toFixed(2);
  }

  getQL(backOdds:number, layOdds:number, stake:number):string{
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    var ql = layStake-stake
    this.sabFormValues.get('QL').setValue(ql.toFixed(2));
    return ql.toFixed(2);
  }
  getEstValue(backOdds:number, layOdds:number, stake:number):string{
    var fta:number = this.calcFTA(backOdds,layOdds, stake);
    var ql: number = this.calcQL(backOdds, layOdds, stake);
    var evTotal:number = this.calcEVTotal(fta, ql);

    var evThisBet:number = +(evTotal/+this.data.activeBet.occ);
    this.sabFormValues.get('EstValue').setValue(evThisBet.toFixed(2));
    return evThisBet.toFixed(2);
  }

  getFTA(backOdds:number, layOdds:number, stake:number):string{
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    var fta:number = (stake * (backOdds - 1 ) + layStake);
    this.sabFormValues.get('FTA').setValue(fta.toFixed(2));
    return fta.toFixed(2);
  }


  getROI(backOdds:number, layOdds:number, stake:number):string{
    var evThisBet:number = +this.getEstValue(backOdds, layOdds, stake);
    var roi = (evThisBet/stake);
    this.sabFormValues.get('ROI').setValue(roi.toFixed(2));
    return roi.toFixed(2);
  }

  setPL(){

  }

  getBetState():boolean{
    return true
  }

  calcLayStake(backOdds:number, layOdds:number, stake:number):number {
    return (+backOdds/+layOdds*stake);
  }

  calcQL(backOdds:number, layOdds:number, stake:number): number {
    return this.calcLayStake(backOdds, layOdds,stake)-stake;
  }

  calcFTA(backOdds, layOdds, stake):number {
    var layStake:number = this.calcLayStake(backOdds,layOdds,stake);
    return +stake * (+backOdds - 1) + layStake;
  }

  calcEVTotal(fta:number, ql:number):number {
    return +fta + (+ql * (+this.data.activeBet.occ - 1));
  }

}
