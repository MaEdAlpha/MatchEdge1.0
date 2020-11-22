import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CalcSettings } from './calc-settings.model';
import { CalcSettingsService } from './calc-settings.service';


@Component({
  selector: 'app-calc',
  templateUrl: './calc-settings.component.html',
  styleUrls: ['./calc-settings.component.css']
})
export class CalcSettingsComponent implements OnInit {
  @ViewChild('stakeValues') stakeFormData: NgForm;

  isOpened: boolean = false;
  defaultChecked: boolean = true;
  isSaved: boolean = false;

  stakeRanges: string[];
  defaultStakes: CalcSettings[];
  stakes: CalcSettings[];
  userStakes: CalcSettings[];

  constructor(private calcSettingsService: CalcSettingsService) { }

  ngOnInit(): void {
    this.retrieveSettings();
  }

  populateStakes() {
    this.stakeFormData.setValue({
      stakeData: {
        user0Stakes: this.userStakes[0].stake,
        user1Stakes: this.userStakes[1].stake,
        user2Stakes: this.userStakes[2].stake,
        user3Stakes: this.userStakes[3].stake,
        user4Stakes: this.userStakes[4].stake,
        user5Stakes: this.userStakes[5].stake,
        user6Stakes: this.userStakes[6].stake,
      }
    });
  }

  retrieveSettings(){
    this.userStakes = this.calcSettingsService.getUserStakes();
    this.defaultStakes = this.calcSettingsService.getDefaultStakes();
    this.stakeRanges = this.calcSettingsService.getRanges();
  }

  saveStakePref(stakeValues: NgForm)
  {
    console.log(stakeValues.form.value.stakeData);
    //TODO
     this.userStakes[0].stake = stakeValues.form.value.stakeData.user0Stakes;
     this.userStakes[1].stake = stakeValues.form.value.stakeData.user1Stakes;
     this.userStakes[2].stake = stakeValues.form.value.stakeData.user2Stakes;
     this.userStakes[3].stake = stakeValues.form.value.stakeData.user3Stakes;
     this.userStakes[4].stake = stakeValues.form.value.stakeData.user4Stakes;
     this.userStakes[5].stake = stakeValues.form.value.stakeData.user5Stakes;
     this.userStakes[6].stake = stakeValues.form.value.stakeData.user6Stakes;
    this.calcSettingsService.saveToUserProfile(this.userStakes);
  }
  setStakes(){
    this.stakeFormData.setValue({
      stakeData: {
        user0Stakes: this.defaultStakes[0].stake,
        user1Stakes: this.defaultStakes[1].stake,
        user2Stakes: this.defaultStakes[2].stake,
        user3Stakes: this.defaultStakes[3].stake,
        user4Stakes: this.defaultStakes[4].stake,
        user5Stakes: this.defaultStakes[5].stake,
        user6Stakes: this.defaultStakes[6].stake,
      }
    });
  }
}
