import { Component, OnInit, EventEmitter, ViewChild, AfterViewInit, ChangeDetectorRef, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import { UserPropertiesService } from '../services/user-properties.service';
import {  TablePreferences } from '../user-properties.model';
import { Subscription } from 'rxjs';
import { evValidator, mrValidator, oddsValidator, ssValidator } from '../directives/compare-filter-settings.directive';



interface LeagueGroup {
  country: string;
  leagues: string[];
}

interface TimeRange {
  timeKey: string;
  timeValue: string;
}

@Component({
  selector: 'app-filter-settings',
  templateUrl: './filter-settings.component.html',
  styleUrls: ['./filter-settings.component.css']
})
export class FilterSettingsComponent implements OnInit {

@Input() filtersFormValues:any;
@Output() filtersFormValuesChange= new EventEmitter<any>();
  //sidnav modetype
  mode: string = "side";

  //properties of league selection drop down
  allSelected: boolean = true;
  selectedTime: string;
  viewTableForm: FormGroup;
  userPrefSubscription: Subscription;
  prefObj: TablePreferences;
  timeRange: string;
  evFilterI: number;
  evFilterII: number;
  minOddsFilter: number;
  maxOddsFilter: number;
  matchRatingFilterI: number;
  matchRatingFilterII:number;
  secretSauceI:number;
  secretSauceII:number;
  fvSelected: string;
  evPlaceholder: string;
  audioEnabled: boolean;
  enableSaveButton:boolean = true;

      filters: any[] = [
        { option: 'Expected Value (£)', value: '1' },
        { option: 'Match Rating (%)', value: '2' },
        { option: 'Qualifying Loss (%)', value: '3'}
      ]

  constructor( private userPrefService: UserPropertiesService, private chRef: ChangeDetectorRef) {}


  ngOnInit(): void {

    this.evPlaceholder = +this.filtersFormValues.Filter == 1 ? "EV" : +this.filtersFormValues.Filter == 2 ? "Match Rating" : +this.filtersFormValues.Filter == 3 ? "Secret Sauce" : "null" ;
    console.log(this.filtersFormValues);

    var filterValidator: ValidatorFn[] = [Validators.required, Validators.pattern("^[0-9\.\-]*$"), Validators.maxLength(7)];
    var mrFilterValidator: ValidatorFn[] = [Validators.required, Validators.pattern("^[0-9\.\-]*$"), Validators.maxLength(7), Validators.max(100), Validators.min(0)]


    this.viewTableForm = new FormGroup({
      'minOdds': new FormControl(this.filtersFormValues.MinOdds, filterValidator),
      'maxOdds': new FormControl(this.filtersFormValues.MaxOdds, filterValidator),
      'evFilterValueI': new FormControl(this.filtersFormValues.EVI, filterValidator),
      'evFilterValueII': new FormControl(this.filtersFormValues.EVII, filterValidator),
      'matchRatingFilterI': new FormControl(this.filtersFormValues.MRI, mrFilterValidator),
      'matchRatingFilterII': new FormControl(this.filtersFormValues.MRII, mrFilterValidator),
      'secretSauceI': new FormControl(this.filtersFormValues.SSI, filterValidator),
      'secretSauceII': new FormControl(this.filtersFormValues.SSII, filterValidator),
      'fvSelected': new FormControl(this.filtersFormValues.Filter),
      'isAudioEnabled': new FormControl(this.filtersFormValues.Audio),
    }, { validators: [oddsValidator, evValidator, mrValidator, ssValidator]});

    //Subscribe to update. Retrieves UserPreferences from Service. Subscribes to it.
    this.userPrefSubscription = this.userPrefService.getUserPrefs().subscribe( tablePref => {
      this.prefObj = tablePref;
      this.timeRange = tablePref.timeRange;
      this.evFilterI = Number(tablePref.evFVI);
      this.evFilterII= Number(tablePref.evFVII);
      this.minOddsFilter= Number(tablePref.minOdds);
      this.maxOddsFilter= Number(tablePref.maxOdds);
      this.matchRatingFilterI= Number(tablePref.matchRatingFilterI);
      this.matchRatingFilterII=Number(tablePref.matchRatingFilterII);
      this.secretSauceI= Number(tablePref.secretSauceI);
      this.secretSauceII=Number(tablePref.secretSauceII);
      this.fvSelected = tablePref.fvSelected;
      this.evPlaceholder = +this.filtersFormValues.Filter == 1 ? "EV" : +this.filtersFormValues.Filter == 2 ? "Match Rating" : +this.filtersFormValues.Filter == 3 ? "Secret Sauce" : "null" ;
      this.audioEnabled = tablePref.audioEnabled;
    });

    this.viewTableForm.valueChanges.subscribe( value => {
      this.filtersFormValuesChange.emit(value);
    });
  }

  ngAfterViewInit() {

  }

  onSubmit(){
   /* send this data to user preferences and other webservices for handling.
    emit this so services can hear and set to matchStats/juicymatch component.
    set in program to validate for juicy matches. */
    console.log(this.viewTableForm.value);

    this.userPrefService.setFormValues(this.viewTableForm.value);
  }
  filterValueValidator(firstNumber:number): ValidatorFn
  {
    return (control: AbstractControl): { [key: string]: any } | null =>
    +control.value >= firstNumber ? null : {valueTooLow: control.value};
  }
  getErrorMessage() {
    var formInput = this.viewTableForm.controls;

    if(formInput.minOdds.errors || formInput.maxOdds.errors || formInput.evFilterValueI.errors || formInput.evFilterValueII.errors || formInput.matchRatingFilterI.errors || formInput.matchRatingFilterII.errors || formInput.secretSauceI.errors || formInput.secretSauceII.errors){
      return 'Invalid entry, please enter a valid number'
    }
  }

  getFormErrorMessage():string{

    var errorCount = Object.keys(this.viewTableForm.errors).length;

    if(this.viewTableForm.errors?.mrMismatch){
      return " Invalid"
    }

    if(errorCount == 1){
      this.enableSaveButton = false;

      if(this.viewTableForm.errors.oddsMismatch){
        return " Odds filter";
      }
        if(this.viewTableForm.errors.evMismatch){
        return " EV filter";
      }
        if(this.viewTableForm.errors.mrMismatch){
        return " Match Rating filter";
      }
        if(this.viewTableForm.errors.ssMismatch){
        return " Secret Sauce filter";
      }

    }
    if(errorCount == 2){
      this.enableSaveButton = false;
      if(this.viewTableForm.errors.oddsMismatch && this.viewTableForm.errors.evMismatch){
        return " Odds and EV filters";
      }
        if(this.viewTableForm.errors.oddsMismatch && this.viewTableForm.errors.mrMismatch ){
        return " Odds and Match Rating";
      }
        if(this.viewTableForm.errors.oddsMismatch  && this.viewTableForm.errors.ssMismatch ){
        return " Odds and Secret Sauce filters";
      }
        if(this.viewTableForm.errors.evMismatch && this.viewTableForm.errors.ssMismatch ){
        return " EV and Secret Sauce filters";
      }
       if( this.viewTableForm.errors.evMismatch && this.viewTableForm.errors.mrMismatch ){
        return " EV and Match Rating filters";
      }
      if( this.viewTableForm.errors.mrMismatch && this.viewTableForm.errors.ssMismatch ){
        return " Match Rating, and Secret Sauce filters";
      }

    }
    if(errorCount == 3){
      this.enableSaveButton = false;
      if(this.viewTableForm.errors.oddsMismatch && this.viewTableForm.errors.evMismatch && this.viewTableForm.errors.mrMismatch ){
        return " Odds, EV, and Match Rating filters";
      }
        if(this.viewTableForm.errors.oddsMismatch && this.viewTableForm.errors.evMismatch  && this.viewTableForm.errors.ssMismatch ){
        return " Odds, EV, and Secret Sauce filters";
      }
        if(this.viewTableForm.errors.evMismatch && this.viewTableForm.errors.mrMismatch && this.viewTableForm.errors.ssMismatch ){
        return " EV, Match Rating, and Secret Sauce filters";
      }
      if(this.viewTableForm.errors.oddsMismatch && this.viewTableForm.errors.mrMismatch && this.viewTableForm.errors.ssMismatch ){
        return " Odds Range, Match Rating, and Secret Sauce filters";
      }

    }
    if(errorCount == 4){
      this.enableSaveButton = false;
      if(this.viewTableForm.errors.oddsMismatch && this.viewTableForm.errors.evMismatch && this.viewTableForm.errors.mrMismatch && this.viewTableForm.errors.ssMismatch ){
        return " Odds, EV, Match Rating, and Secret Sauce filters";
      }
    }
  }


  getRealtimeUpdate(){
    // console.log(this.sabFormValues.touched + " " + this.sabFormValues.status );
    this.viewTableForm.touched && this.viewTableForm.status == 'VALID' ? this.enableSaveButton=true : this.enableSaveButton=false;
    return this.viewTableForm;
  }

  test(){
    console.log(this.filtersFormValues);



  }
}
