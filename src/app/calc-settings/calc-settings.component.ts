import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CalcSettingsService } from './calc-settings.service';


@Component({
  selector: 'app-calc',
  templateUrl: './calc-settings.component.html',
  styleUrls: ['./calc-settings.component.css']
})
export class CalcSettingsComponent implements OnInit {
  @ViewChild('stakeValues') stakeFormData: NgForm;
  isOpened: boolean = false;
  defaultChecked: boolean = false;
  isSaved: boolean = false;
  stakeRanges: string[] = ["1.5 - 2.0", "2.0 - 3.0", "3.0 - 4.0 ", "4.0 - 5.0", "5.0 - 6.0", "6.0 - 7.0", "    > 7.0 "]
  defaultStakes: number[]=[100,80,60,50,40,20,10];
  stakes: number[] = [];
  userStakes: number[];
  constructor(private calcSettingsService: CalcSettingsService) { }

  ngOnInit(): void {
    this.retrieveSettings();
  }

  populateStakes() {
    this.stakeFormData.setValue({
      stakeData: {
        user0Stakes: this.userStakes[0],
        user1Stakes: this.userStakes[1],
        user2Stakes: this.userStakes[2],
        user3Stakes: this.userStakes[3],
        user4Stakes: this.userStakes[4],
        user5Stakes: this.userStakes[5],
        user6Stakes: this.userStakes[6],
      }
    });
  }

  retrieveSettings(){
    this.userStakes = this.calcSettingsService.getUserStakes();
  }

  saveStakePref(stakeValues: NgForm)
  {
    console.log(stakeValues.form.value.stakeData);
    //TODO
    //take the userInputs and save to userStakes[];
  }
  setStakes(){
    this.stakeFormData.setValue({
      stakeData: {
        user0Stakes: this.defaultStakes[0],
        user1Stakes: this.defaultStakes[1],
        user2Stakes: this.defaultStakes[2],
        user3Stakes: this.defaultStakes[3],
        user4Stakes: this.defaultStakes[4],
        user5Stakes: this.defaultStakes[5],
        user6Stakes: this.defaultStakes[6],
      }
    });
  }
}
