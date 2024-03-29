import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';
import { SavedActiveBetsService } from '../services/saved-active-bets.service';
import { UserPropertiesService } from '../services/user-properties.service';

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
  formFtaOption: number;
  sabFormValues: FormGroup;
  isDisabled:boolean;
  userCommission: number;

  constructor(private chRef: ChangeDetectorRef,
              public dialogRef: MatDialogRef<PopupFormSavedBetsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private savedActiveBetService: SavedActiveBetsService,
              private fb: FormBuilder,
              private userPropService: UserPropertiesService ) {

      console.log("In Form Saved List.");
      console.log(data);

      this.sabList = this.savedActiveBetService.getSelectionSAB(this.data.activeBet);
      this.isEdit = data.isEdit;
      this.isEarlyCashout=false;
      this.isDisabled=true;
      //formFtaOption 1 = custom FTA | 0 = 65 avg FTA. By default when adding a new match is is loaded based off user preferences. If an edit, it's based off of the state when it was saved to ActiveBets.
      this.formFtaOption = this.data.isBrkzFTA;
      this.createForm(data);
     }

  private createForm(data: any) {

    var stakeValidator:ValidatorFn[] = [ Validators.required,Validators.pattern("^[0-9\.\-]*$"), Validators.maxLength(7)];
    var oddsValidator: ValidatorFn[] = [ Validators.required, Validators.minLength(1), Validators.pattern("^[0-9\.]*$"), Validators.maxLength(6)];
    var commentValidator: ValidatorFn[] = [Validators.maxLength(140)];
    return this.sabFormValues = this.fb.group({
      Stake:new FormControl(data.activeBet.stake, stakeValidator),
      LayStake: new FormControl({value:(data.activeBet.backOdd / data.activeBet.layOdd * data.activeBet.stake).toPrecision(2)}),
      BackOdds: new FormControl(data.activeBet.backOdd, oddsValidator),
      LayOdds: new FormControl(data.activeBet.layOdd, oddsValidator),
      Liability: new FormControl(data.activeBet.liability),
      QL: new FormControl({value:data.activeBet.ql }),
      EstValue: new FormControl({value:data.activeBet.ev}),
      MRValue: new FormControl({value:data.activeBet.mr}),
      Sauce: new FormControl({value:data.activeBet.sauce}),
      FTA: new FormControl({value:data.activeBet.fta}),
      ROI: new FormControl({value:data.activeBet.roi}),
      BetState: new FormControl(data.activeBet.betState),
      FtaOption: new FormControl(data.activeBet.isBrkzFTA),
      MatchInfo: new FormControl(data.activeBet.comment, commentValidator),
      PL: new FormControl(data.activeBet.pl, stakeValidator),
    });
  }

  getErrorMessage() {
    var formInput = this.sabFormValues.controls;
    if(formInput.BackOdds.errors || formInput.Stake.errors || formInput.LayOdds.errors || formInput.PL.errors){
      return 'Manually create a slip by filling in the highlighted fields';
    }
    if(formInput.MatchInfo.errors){
      return 'Allowed char. ' + '(' + this.sabFormValues.value.MatchInfo.length + '/' + this.sabFormValues.controls.MatchInfo.errors.maxlength.requiredLength + ')';
    }
  }

  ngOnInit(): void {
    this.formFtaOption = this.sabFormValues.get("FtaOption").value;
    this.userCommission = this.userPropService.getCommission();
  }

  ngAfterViewInit(){
    this.chRef.detectChanges();
  }

  onNoClick():void {
    this.dialogRef.close();
    //Input, if edits have been made, dirty == true, then have a popup asking if you want to exit without saving.
  }

  updateForm():void {
    if(!this.isDisabled){
      !this.data.isEdit ? this.data.activeBet.created = Date.now() : '';
      this.data.activeBet.backOdd = this.sabFormValues.value.BackOdds;
      this.data.activeBet.betState = this.sabFormValues.value.BetState;
      //Mat Slide Toggle returns true or false, set numbers incase we add new FTA calcs in the future and want more options
      this.data.activeBet.isBrkzFTA = this.sabFormValues.value.FtaOption ? 1:0;
      this.data.activeBet.ev = this.sabFormValues.value.EstValue;
      this.data.activeBet.mr = this.sabFormValues.value.MRValue;
      this.data.activeBet.sauce = this.sabFormValues.value.Sauce;
      this.data.activeBet.fta = this.sabFormValues.value.FTA;
      this.data.activeBet.layOdd = this.sabFormValues.value.LayOdds;
      this.data.activeBet.layStake = this.sabFormValues.value.LayStake;
      this.data.activeBet.liability = this.sabFormValues.value.Liability;
      this.data.activeBet.comment = this.sabFormValues.value.MatchInfo;
      this.data.activeBet.pl = this.sabFormValues.value.PL;
      this.data.activeBet.ql = this.sabFormValues.value.QL;
      this.data.activeBet.roi = this.sabFormValues.value.ROI;
      this.data.activeBet.stake = this.sabFormValues.value.Stake;
      console.log(this.data.activeBet);

      this.savedActiveBetService.updateActiveBets( this.data.activeBet as ActiveBet, this.data.isEdit);

      //save data in directive
      this.dialogRef.close();
    }
  }

  getRealtimeUpdate(){
    // console.log(this.sabFormValues.touched + " " + this.sabFormValues.status );
    this.sabFormValues.touched && this.sabFormValues.status == 'VALID' ? this.isDisabled=false : this.isDisabled=true;
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

  QL(backOdds:number, layOdds:number, stake:number):string{
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    var ql = (+layStake*(1-this.userCommission/100) - +stake);
    ql = this.filterValue(ql);
    this.sabFormValues.get('QL').setValue(ql.toFixed(2));
    if(!this.isEdit){
      this.sabFormValues.get('PL').setValue(ql.toFixed(2));
    }
    return ql.toFixed(2);
  }
  NewSS(backOdds:number, layOdds:number, stake:number):string{
    var fta = +this.FTA(stake, backOdds, layOdds);
    var ql = +this.QL(backOdds, layOdds, stake);
    var qlPercentage = +(ql/fta*100);
    qlPercentage = this.filterValue(qlPercentage);
    this.sabFormValues.get('Sauce').setValue(qlPercentage.toFixed(2));
    return qlPercentage.toFixed(2);
  }

  getMatchRating(backOdds:number, layOdds:number):string{
    var matchRating = +(backOdds/layOdds)*100;
    matchRating = this.filterValue(matchRating);
    this.sabFormValues.get('MRValue').setValue(matchRating.toFixed(2));
    return matchRating.toFixed(2);
  }
  getEstValue(backOdds:number, layOdds:number, stake:number):string{
    var fta:number = this.calcFTA(backOdds,layOdds, stake);
    var ql: number = this.calcQL(backOdds, layOdds, stake);
    var evTotal:number = this.calcEVTotal(fta, ql);
    //
    var evThisBet:number = this.formFtaOption == 1 ? +(evTotal/+this.data.activeBet.occ) : +(evTotal/65) ;
    evThisBet = this.filterValue(evThisBet);
    this.sabFormValues.get('EstValue').setValue(evThisBet.toFixed(2));
    return evThisBet.toFixed(2);
  }

  FTA(stake:number, backOdds:number, layOdds:number):string{
    var layStake:number = this.calcLayStake(backOdds, layOdds, stake);
    var fta:number = (stake * (backOdds - 1 ) + layStake);
    fta = this.filterValue(fta);
    this.sabFormValues.get('FTA').setValue(fta.toFixed(2));
    return fta.toFixed(2);
  }

  getROI(backOdds: number, layOdds:number, stake:number, occurence:number):number{
    var layStake = (+backOdds* +stake / (+layOdds-+this.userCommission/100));
    var fullTurnAround = +stake * (+backOdds -1) + +layStake;
    var ql = +(+layStake- +stake);
    var evTotal = +(fullTurnAround + ( +ql * (+occurence -1)));
    var evThisBet = + (evTotal / occurence );

    return +((evThisBet/stake)*100);
  }

  TotalEV(occurence:number, stake:number, backOdds:number, layOdds:number):number{
    var layStake =  +backOdds * +stake / (+layOdds - (+this.userCommission/100));;
    var result:number = +(+stake * (+backOdds - 1) + +layStake)+ (+layStake- +stake)*(+occurence-1);
    return result;
  }

  //Match rating should also account user commission.
  NewMatchRating(backOdds:number, layOdds:number){
    return +(backOdds/(layOdds-+this.userCommission/100))*100;
  }

  test(){
    var selected = this.sabFormValues.get('FtaOption').value;
    console.log(selected);
  }

  updateFTA(){
    //if user selects toggle, set FormFTAOPtion
    this.formFtaOption = this.sabFormValues.get('FtaOption').value ? 1:0;
    console.log(this.formFtaOption);
  }

  getBetState():boolean{
    return true
  }

  calcLayStake(backOdds:number, layOdds:number, stake:number):number {
    return +backOdds * +stake / (+layOdds - (+this.userCommission/100));
  }

  calcQL(backOdds:number, layOdds:number, stake:number): number {
    return this.calcLayStake(backOdds, layOdds,stake)-stake;
  }

  calcFTA(backOdds, layOdds, stake):number {
    var layStake:number = this.calcLayStake(backOdds,layOdds,stake);
    return +stake * (+backOdds - 1) + layStake;
  }

  calcEVTotal(fta:number, ql:number):number {
    var result = this.formFtaOption == 1 ?   +fta + (+ql * (+this.data.activeBet.occ - 1)) :  +fta + (+ql * (65 - 1))
    return result;
  }

  filterValue(input:number){
    var value = ( isNaN(input) || !isFinite(input)) ? 999:input;
    return value;
  }
}
