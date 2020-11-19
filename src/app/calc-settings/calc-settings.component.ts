import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-calc',
  templateUrl: './calc-settings.component.html',
  styleUrls: ['./calc-settings.component.css']
})
export class CalcSettingsComponent implements OnInit {
  isOpened: boolean = false;
  defaultChecked: boolean = true;
  defaultStakes: number[]=[100,80,60,50,40,20,10];
  stakes: number[] = [];
  userStakes: number[] = [200,119,87,14,20,30,10];
  constructor() { }

  ngOnInit(): void {
    this.retrieveSettings();
  }

  ngDoCheck() {
    this.setStakes();
  }

  retrieveSettings(){
    //Calc Services. Get user-Settings from DB
  }

  saveStakePref()
  {
    console.log("Saving...");
    //TODO
    //take the userInputs and save to userStakes[];
  }
  setStakes(){
    if(this.defaultChecked){
      this.stakes = this.defaultStakes;
    }
    if(!this.defaultChecked) {
      this.stakes = this.userStakes;
    }
  }
}
