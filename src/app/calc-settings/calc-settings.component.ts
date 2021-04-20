import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, NgForm } from '@angular/forms';
import { CalcSettings } from './calc-settings.model';
import { CalcSettingsService } from './calc-settings.service';


@Component({
  selector: 'app-calc',
  templateUrl: './calc-settings.component.html',
  styleUrls: ['./calc-settings.component.css']
})
export class CalcSettingsComponent implements OnInit {

  @Input() preferenceFormValues: any;
  @Output() preferenceFormChange= new EventEmitter<any>();
  preferenceForm: FormGroup;
  isOpened: boolean = false;
  defaultChecked: boolean = true;
  isSaved: boolean = false;
  selectedValue: string;

  ftaSelection: { value:string, viewValue:string} [] = [
    { value:'custom', viewValue:'FTA Rating'},
    { value:'generic', viewValue:'1/65 Average'}
  ]

  exchangeSelection: { value: string, viewValue: string}[] = [
    {value: 'smarkets', viewValue: 'Smarkets'}
  ]


  stakeRanges: string[];
  defaultStakes: CalcSettings[];
  userStakes: CalcSettings[];

  constructor(private calcSettingsService: CalcSettingsService) { }

  ngOnInit(): void {
    this.stakeRanges = this.calcSettingsService.getRanges();

    this.preferenceForm = new FormGroup({
      stakes: new FormArray([
         new FormControl(this.preferenceFormValues.PrefStake1),
         new FormControl(this.preferenceFormValues.PrefStake2),
         new FormControl(this.preferenceFormValues.PrefStake3),
         new FormControl(this.preferenceFormValues.PrefStake4),
         new FormControl(this.preferenceFormValues.PrefStake5),
         new FormControl(this.preferenceFormValues.PrefStake6),
         new FormControl(this.preferenceFormValues.PrefStake7),
         new FormControl(this.preferenceFormValues.PrefStake8),
         new FormControl(this.preferenceFormValues.PrefStake9),
         new FormControl(this.preferenceFormValues.PrefStake10)
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
      this.preferenceFormChange.emit(value);

    })
  }

  get stakes(): FormArray {
    return this.preferenceForm.get('stakes') as FormArray;
  }

  get options(): FormArray {
    return this.preferenceForm.get('options') as FormArray;
  }
  // populateStakes() {
  //   this.stakeFormData.setValue({
  //     stakeData: {
  //       user1Stakes: this.preferenceForm.PrefStake1,
  //       user2Stakes: this.preferenceForm.PrefStake2,
  //       user3Stakes: this.preferenceForm.PrefStake3,
  //       user4Stakes: this.preferenceForm.PrefStake4,
  //       user5Stakes: this.preferenceForm.PrefStake5,
  //       user6Stakes: this.preferenceForm.PrefStake6,
  //       user7Stakes: this.preferenceForm.PrefStake7,
  //       user8Stakes: this.preferenceForm.PrefStake8,
  //       user9Stakes: this.preferenceForm.PrefStake9,
  //       user10Stakes: this.preferenceForm.PrefStake10,
  //     }
  //   });
  // }
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
