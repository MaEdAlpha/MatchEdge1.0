import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import { SidenavService } from './sidenav.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core/option';
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
  selector: 'app-view-table-sidenav',
  templateUrl: './view-table-sidenav.component.html',
  styleUrls: ['./view-table-sidenav.component.css'],
})

export class ViewTableSidenavComponent implements OnInit, AfterViewInit {
  @ViewChild('select') select: MatSelect;
  @ViewChild('sidenav') public sidenav: MatSidenav;
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
  isEvSelected: string;
  evPlaceholder: string;
  dialogDisabled: boolean;
  enableSaveButton:boolean = true;

      filters: any[] = [
        { option: 'EV', value: '1' },
        { option: 'Match Rating', value: '2' },
        { option: 'Secret Sauce', value: '3'}
      ]

  constructor(private sidenavService: SidenavService, private userPrefService: UserPropertiesService, private chRef: ChangeDetectorRef) {}

  ngOnInit(): void {

    this.prefObj = this.userPrefService.getFormValues();


    var filterValidator: ValidatorFn[] = [Validators.required, Validators.pattern("^[0-9\.\-]*$"), Validators.maxLength(7)]

    this.viewTableForm = new FormGroup({
      'timeRange': new FormControl(this.prefObj.timeRange, filterValidator),
      'minOdds': new FormControl(this.prefObj.minOdds, filterValidator),
      'maxOdds': new FormControl(this.prefObj.maxOdds, filterValidator),
      'evFilterValueI': new FormControl(this.prefObj.evFilterValueI, filterValidator),
      'evFilterValueII': new FormControl(this.prefObj.evFilterValueII, filterValidator),
      'matchRatingFilterI': new FormControl(this.prefObj.matchRatingFilterI, filterValidator),
      'matchRatingFilterII': new FormControl(this.prefObj.matchRatingFilterII, filterValidator ),
      'secretSauceI': new FormControl(this.prefObj.secretSauceI, filterValidator),
      'secretSauceII': new FormControl(this.prefObj.secretSauceII, filterValidator),
      'isEvSelected': new FormControl(this.prefObj.isEvSelected),

    }, { validators: [oddsValidator, evValidator, mrValidator, ssValidator]});

    //Subscribe to update. Retrieves UserPreferences from Service. Subscribes to it.
    this.userPrefSubscription = this.userPrefService.getUserPrefs().subscribe( tablePref => {
      this.prefObj = tablePref;
      this.timeRange = tablePref.timeRange;
      this.evFilterI = Number(tablePref.evFilterValueI);
      this.evFilterII= Number(tablePref.evFilterValueII);
      this.minOddsFilter= Number(tablePref.minOdds);
      this.maxOddsFilter= Number(tablePref.maxOdds);
      this.matchRatingFilterI= Number(tablePref.matchRatingFilterI);
      this.matchRatingFilterII=Number(tablePref.matchRatingFilterII);
      this.secretSauceI= Number(tablePref.secretSauceI);
      this.secretSauceII=Number(tablePref.secretSauceII);
      this.isEvSelected = tablePref.isEvSelected;
      this.evPlaceholder = this.filters[0].value == 1 ? "EV" : this.filters[1].value == 2 ? "Match Rating" : this.filters[2].value == 3 ? "Secret Sauce" : "null" ;

    });
  }

  ngAfterViewInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }

  onSubmit(){
   /* send this data to user preferences and other webservices for handling.
    emit this so services can hear and set to matchStats/juicymatch component.
    set in program to validate for juicy matches. */
    this.userPrefService.setFormValues(this.viewTableForm.value);

    this.sidenavService.toggle();
  }
  filterValueValidator(firstNumber:number): ValidatorFn
  {
    return (control: AbstractControl): { [key: string]: any } | null =>
    +control.value >= firstNumber ? null : {valueTooLow: control.value};
    // return (control:FormControl) =>{
    //   const form=control.parent;
    //   if (form){
    //     const min = form.get('matchRatingFilterI');
    //     const max = form.get('matchRatingFilterII');
    //     return min.value && max.value && +max.value > +min.value ? null : {error:'This value must be larger than the "filter value to show in Juicy" '};
    //   }
    // }
  }
  getErrorMessage() {
    var formInput = this.viewTableForm.controls;

    if(formInput.minOdds.errors || formInput.maxOdds.errors || formInput.evFilterValueI.errors || formInput.evFilterValueII.errors || formInput.matchRatingFilterI.errors || formInput.matchRatingFilterII.errors || formInput.secretSauceI.errors || formInput.secretSauceII.errors){
      return 'Invalid entry, please enter a valid number'
    }
  }

  getFormErrorMessage():string{

    var errorCount = Object.keys(this.viewTableForm.errors).length;

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
  toggleAllSelection(){
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }

  getRealtimeUpdate(){
    // console.log(this.sabFormValues.touched + " " + this.sabFormValues.status );
    this.viewTableForm.touched && this.viewTableForm.status == 'VALID' ? this.enableSaveButton=true : this.enableSaveButton=false;
    return this.viewTableForm;
  }

  showMe(){
    this.dialogDisabled = !this.dialogDisabled;
    console.log(this.dialogDisabled);
  }
}
