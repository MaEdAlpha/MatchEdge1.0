import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, NgForm } from '@angular/forms';
import { UserPropertiesService } from '../services/user-properties.service';
import { CalcSettings } from './calc-settings.model';
import { CalcSettingsService } from './calc-settings.service';


@Component({
  selector: 'app-calc',
  templateUrl: './calc-settings.component.html',
  styleUrls: ['./calc-settings.component.css']
})
export class CalcSettingsComponent implements OnInit {

  @Input() preferenceFormValues: any;
  @Output() preferenceFormValuesChange= new EventEmitter<any>();
  preferenceForm: FormGroup;
  isOpened: boolean = false;
  defaultChecked: boolean = true;
  isSaved: boolean = false;
  selectedValue: string;

  ftaSelection: { value:string, viewValue:string} [] = [
    { value:'brooks', viewValue:'Juicy-Bets FTA'},
    { value:'generic', viewValue:'Avg 1/65 FTA'}
  ]

  exchangeSelection: { value: string, viewValue: string}[] = [
    {value: 'smarkets', viewValue: 'Smarkets'}
  ]


  oddsRangeUpperLimit: number[];
  stakeRanges: string[];
  defaultStakes: CalcSettings[];
  userStakes: CalcSettings[];

  constructor(private calcSettingsService: CalcSettingsService, private userPropertiesService: UserPropertiesService) { }

  ngOnInit(): void {
    this.stakeRanges = this.calcSettingsService.getRanges();
    this.oddsRangeUpperLimit = this.calcSettingsService.getOddsRangeUpperLimit();
    this.userStakes = this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes;

    this.preferenceForm = new FormGroup({
      stakes: new FormArray([
         new FormControl(this.userStakes[0]),
         new FormControl(this.userStakes[1]),
         new FormControl(this.userStakes[2]),
         new FormControl(this.userStakes[3]),
         new FormControl(this.userStakes[4]),
         new FormControl(this.userStakes[5]),
         new FormControl(this.userStakes[6]),
         new FormControl(this.userStakes[7]),
         new FormControl(this.userStakes[8]),
         new FormControl(this.userStakes[9])
      ]),
      options: new FormGroup({
        FTASelected: new FormControl(this.preferenceFormValues.SelectedFTA),
        Exchange: new FormControl(this.preferenceFormValues.SelectedExchange),
        Commission: new FormControl(this.preferenceFormValues.SelectedCommission)
      })
    });
    // this.retrieveSettings();
    // this.populateStakes();

    this.preferenceForm.valueChanges.subscribe( value => {
      console.log("PreferenceForm!!!");
      console.log(value);

      this.preferenceFormValuesChange.emit(value);

    });
  }

  get stakes(): FormArray {
    return this.preferenceForm.get('stakes') as FormArray;
  }

  get options(): FormArray {
    return this.preferenceForm.get('options') as FormArray;
  }

  calcLiability(index:number){
    let liabilityCalculation = this.preferenceForm.value.stakes[index] * (this.oddsRangeUpperLimit[index]-1)

    return liabilityCalculation;
  }

  calcFTAReturn(index:number){
    let ftaCalculation = this.preferenceForm.value.stakes[index] * this.oddsRangeUpperLimit[index];
    return ftaCalculation;
  }

  saveStakePref()
  {
    // console.log(stakeValues.form.value.stakeData);
    //TODO
    //  this.userStakes[0].stake = stakeValues.form.value.stakeData.user0Stakes;
    //  this.userStakes[1].stake = stakeValues.form.value.stakeData.user1Stakes;
    //  this.userStakes[2].stake = stakeValues.form.value.stakeData.user2Stakes;
    //  this.userStakes[3].stake = stakeValues.form.value.stakeData.user3Stakes;
    //  this.userStakes[4].stake = stakeValues.form.value.stakeData.user4Stakes;
    //  this.userStakes[5].stake = stakeValues.form.value.stakeData.user5Stakes;
    //  this.userStakes[6].stake = stakeValues.form.value.stakeData.user6Stakes;
    //  this.userStakes[7].stake = stakeValues.form.value.stakeData.user7Stakes;
    //  this.userStakes[8].stake = stakeValues.form.value.stakeData.user8Stakes;
    //  this.userStakes[9].stake = stakeValues.form.value.stakeData.user9Stakes;
    // this.calcSettingsService.saveToUserProfile(this.userStakes);
  }
  // setStakes(){
  //   this.stakeFormData.setValue({
  //     stakeData: {
  //       user0Stakes: this.defaultStakes[0].stake,
  //       user1Stakes: this.defaultStakes[1].stake,
  //       user2Stakes: this.defaultStakes[2].stake,
  //       user3Stakes: this.defaultStakes[3].stake,
  //       user4Stakes: this.defaultStakes[4].stake,
  //       user5Stakes: this.defaultStakes[5].stake,
  //       user6Stakes: this.defaultStakes[6].stake,
  //       user7Stakes: this.defaultStakes[7].stake,
  //       user8Stakes: this.defaultStakes[8].stake,
  //       user9Stakes: this.defaultStakes[9].stake,
  //     }
  //   });
  // }

  test(){
    console.log(this.preferenceForm);
    console.log(this.preferenceForm.value.options.Exchange)

    // console.log(this.stakeFormData);


  }
}
