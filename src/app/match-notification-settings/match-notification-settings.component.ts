import { Component, OnInit, ViewChild } from '@angular/core';
import { TriggerOdds } from './trigger-odds.model';
import { NgForm } from '@angular/forms';
import { UserPropertiesService } from '../services/user-properties.service';

@Component({
  selector: 'app-match-notification-settings',
  templateUrl: './match-notification-settings.component.html',
  styleUrls: ['./match-notification-settings.component.css']
})
export class MatchNotificationSettingsComponent implements OnInit {
  smCommission: number;
  onEditClick = false;
  defaultSmCommiss: number = 2.00;


  @ViewChild('triggerData') triggerDataForm: NgForm;

  triggerOdds:TriggerOdds[];

  constructor(private userPropertiesService: UserPropertiesService) { }

  ngOnInit(): void {
    //if user does not have commission saved then use default
    this.smCommission = this.userPropertiesService.getCommission();
    this.triggerOdds = this.userPropertiesService.getTriggerOdds();
    this.userPropertiesService.triggerOddsSelected
      .subscribe( (
        triggerOdds: TriggerOdds[]) => {
        this.triggerOdds = triggerOdds;
        }
      );
  }

  onSaveCommission() {
    console.log(this.smCommission);
    //TODO send this variable to database
    this.userPropertiesService.setCommission(this.smCommission);
    this.onEditClick=!this.onEditClick;
  }

  onSubmitTrigger(fTriggerData: NgForm)
  {
    const formTriggerData = fTriggerData.form.value.triggerData;
    this.triggerOdds[0].start = formTriggerData.toStart0;
    this.triggerOdds[0].finish = formTriggerData.toFinish0;
    this.triggerOdds[1].start = formTriggerData.toStart1;
    this.triggerOdds[1].finish = formTriggerData.toFinish1;
    this.triggerOdds[2].start = formTriggerData.toStart2;
    this.triggerOdds[2].finish = formTriggerData.toFinish2;
    this.triggerOdds[3].start = formTriggerData.toStart3;
    this.triggerOdds[3].finish = formTriggerData.toFinish3;
    this.triggerOdds[4].start = formTriggerData.toStart4;
    this.triggerOdds[4].finish= formTriggerData.toFinish4
    this.triggerOdds[5].start = formTriggerData.toStart5;
    this.triggerOdds[5].finish= formTriggerData.toFinish5;
    this.triggerOdds[6].start = formTriggerData.toStart6;
    this.triggerOdds[6].finish= formTriggerData.toFinish6;
    this.triggerOdds[7].start = formTriggerData.toStart7;
    this.triggerOdds[7].finish= formTriggerData.toFinish7;
    this.triggerOdds[8].start = formTriggerData.toStart8;
    this.triggerOdds[8].finish = formTriggerData.toFinish8;
    this.triggerOdds[9].start = formTriggerData.toStart9;
    this.triggerOdds[9].finish = formTriggerData.toFinish9;
    this.triggerOdds[10].start = formTriggerData.toStart10;
    this.triggerOdds[10].finish = formTriggerData.toFinish10;
    this.triggerOdds[11].start = formTriggerData.toStart11;
    this.triggerOdds[11].finish = formTriggerData.toFinish11;
    this.triggerOdds[12].start = formTriggerData.toStart12;
    this.triggerOdds[12].finish = formTriggerData.toFinish12;
    //TODO Use matches Service to write this to DB.
    this.userPropertiesService.triggerOddsSelected.emit(this.triggerOdds);
    // this.triggerOdds.forEach(item => {
    //   console.log(item);

    // })
  }

  getCommission()
  {
    //TODO call on matchServices to return the Commission Value that is saved in DB
  }

  saveCommission()
  {
    //TODO use matchServices to write to DB.
  }
}
