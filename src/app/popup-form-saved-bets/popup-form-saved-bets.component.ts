import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
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
     }

  private createForm(data: any) {

    var stakeValidator:ValidatorFn[] = [ Validators.required,Validators.pattern("^[0-9\.]*$"), Validators.maxLength(7)];
    var oddsValidator: ValidatorFn[] = [ Validators.required, Validators.minLength(1),Validators.pattern("^[0-9\.]*$"), Validators.maxLength(6)];

    return this.sabFormValues = this.fb.group({
      Stake:new FormControl(data.activeBet.stake, stakeValidator),
      LayStake: new FormControl({value:(data.activeBet.backOdd / data.activeBet.layOdd * data.activeBet.stake).toPrecision(2), disabled:true}),
      BackOdds: new FormControl(data.activeBet.backOdd, oddsValidator),
      LayOdds: new FormControl(data.activeBet.layOdd, oddsValidator),
      Liability: new FormControl(data.activeBet.liability),
      QL: new FormControl({value:data.activeBet.ql, disabled:true}),
      EstValue: new FormControl({value:data.activeBet.ev, disabled:true}),
      FTA: new FormControl({value:data.activeBet.fta, disabled:true}),
      ROI: new FormControl({value:data.activeBet.roi, disabled:true}),
      BetState: new FormControl(data.activeBet.betState),
      PL: new FormControl({value:data.activeBet.pl, disabled:true}),
    });
  }

  getErrorMessage() {
    var formInput = this.sabFormValues.controls;
    if(formInput.BackOdds.errors || formInput.Stake.errors || formInput.LayOdds.errors){
      return 'Invalid entry';
    }
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
    layStake = this.filterValue(layStake);
    this.sabFormValues.get('LayStake').setValue(layStake.toFixed(2));
    return layStake.toFixed(2);
  }

  getLiability(backOdds:number, layOdds:number, stake:number ):string{
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    var liability = (layOdds - 1) * layStake;
    liability = this.filterValue(liability);
    this.sabFormValues.get('Liability').setValue(liability.toFixed(2));
    return liability.toFixed(2);
  }

  getQL(backOdds:number, layOdds:number, stake:number):string{
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    var ql = layStake-stake;
    ql = this.filterValue(ql);
    this.sabFormValues.get('QL').setValue(ql.toFixed(2));
    return ql.toFixed(2);
  }
  getEstValue(backOdds:number, layOdds:number, stake:number):string{
    var fta:number = this.calcFTA(backOdds,layOdds, stake);
    var ql: number = this.calcQL(backOdds, layOdds, stake);
    var evTotal:number = this.calcEVTotal(fta, ql);

    var evThisBet:number = +(evTotal/+this.data.activeBet.occ);
    evThisBet = this.filterValue(evThisBet);
    this.sabFormValues.get('EstValue').setValue(evThisBet.toFixed(2));
    return evThisBet.toFixed(2);
  }

  getFTA(backOdds:number, layOdds:number, stake:number):string{
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    var fta:number = (stake * (backOdds - 1 ) + layStake);
    fta = this.filterValue(fta);
    this.sabFormValues.get('FTA').setValue(fta.toFixed(2));
    return fta.toFixed(2);
  }


  getROI(backOdds:number, layOdds:number, stake:number):string{
    var evThisBet:number = +this.getEstValue(backOdds, layOdds, stake);
    var roi = (evThisBet/stake);
    this.filterValue(backOdds) == 999 ? roi = 999: roi = this.filterValue(roi);
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

  filterValue(input:number){
    var value = ( isNaN(input) || !isFinite(input)) ? 999:input;
    return value;
  }


}
