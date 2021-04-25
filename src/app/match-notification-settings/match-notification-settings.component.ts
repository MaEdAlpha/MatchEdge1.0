import { Component, OnInit, ViewChild } from '@angular/core';
import { TriggerOdds } from './trigger-odds.model';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
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
  settingsForm: FormGroup;


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

      this.settingsForm = new FormGroup({
        account: new FormGroup({
                                UserName: new FormControl(this.userPropertiesService.getUserSettings().account.username),
                                FirstName: new FormControl(this.userPropertiesService.getUserSettings().account.firstName),
                                LastName: new FormControl(this.userPropertiesService.getUserSettings().account.lastName),
                                Email: new FormControl(this.userPropertiesService.getUserSettings().account.email),
                                Quote: new FormControl(this.userPropertiesService.getUserSettings().account.quote),
                                Password: new FormControl(this.userPropertiesService.getUserSettings().account.password)
        }),
        preferences:new FormGroup({
                                  PrefStake1: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[0].stake),
                                  PrefStake2: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[1].stake),
                                  PrefStake3: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[2].stake),
                                  PrefStake4: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[3].stake),
                                  PrefStake5: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[4].stake),
                                  PrefStake6: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[5].stake),
                                  PrefStake7: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[6].stake),
                                  PrefStake8: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[7].stake),
                                  PrefStake9: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[8].stake),
                                  PrefStake10: new FormControl(this.userPropertiesService.getUserSettings().preferences.userPrefferedStakes[9].stake),
                                  SelectedFTA: new FormControl(this.userPropertiesService.getUserSettings().preferences.ftaOption),
                                  SelectedExchange: new FormControl(this.userPropertiesService.getUserSettings().preferences.exchangeOption.name),
                                  SelectedCommission: new FormControl(this.userPropertiesService.getUserSettings().preferences.exchangeOption.commission)
        }),
        filters: new FormGroup({
                                MinOdds: new FormControl( this.userPropertiesService.getUserSettings().filters.minOdds),
                                MaxOdds: new FormControl( this.userPropertiesService.getUserSettings().filters.maxOdds),
                                EVI: new FormControl(this.userPropertiesService.getUserSettings().filters.evFilterValueI),
                                EVII: new FormControl(this.userPropertiesService.getUserSettings().filters.evFilterValueII),
                                MRI: new FormControl(this.userPropertiesService.getUserSettings().filters.matchRatingFilterI),
                                MRII: new FormControl(this.userPropertiesService.getUserSettings().filters.matchRatingFilterII),
                                SSI: new FormControl(this.userPropertiesService.getUserSettings().filters.secretSauceI),
                                SSII: new FormControl(this.userPropertiesService.getUserSettings().filters.secretSauceII),
                                Filter: new FormControl(this.userPropertiesService.getUserSettings().filters.isEvSelected),
                                Audio: new FormControl(this.userPropertiesService.getUserSettings().filters.audioEnabled),
        })
      });
  }

  onSubmitTrigger(fTriggerData: NgForm)
  {
    // Save all forms that have come back validated.
  }

  onClickClose(){

  }

  test(){
    console.log(this.settingsForm);
    console.log(this.settingsForm.get('account').get('UserName').setValue('Chuckles'));
    console.log(this.settingsForm.get('account').get('UserName').value);

  }

  savePreferences(){

  }

  updateAccountChanges(value:any){
    this.settingsForm.controls['account'].setValue({
      UserName: value.UserName,
      FirstName: value.FirstName,
      LastName: value.LastName,
      Email: value.Email,
      Quote: value.Quote,
      Password: value.Password
    });
  }

  updatePreferenceChanges(value: any){
    this.settingsForm.controls['preferences'].setValue({
      PrefStake1: value.stakes[0],
      PrefStake2: value.stakes[1],
      PrefStake3: value.stakes[2],
      PrefStake4: value.stakes[3],
      PrefStake5: value.stakes[4],
      PrefStake6: value.stakes[5],
      PrefStake7: value.stakes[6],
      PrefStake8: value.stakes[7],
      PrefStake9: value.stakes[8],
      PrefStake10: value.stakes[9],
      SelectedFTA: value.options.FTASelected,
      SelectedExchange: value.options.Exchange,
      SelectedCommission: value.options.Commission
    });
  }

  updateFilterChanges(value:any){
    this.settingsForm.controls['filters'].setValue({
      MinOdds: value.minOdds,
      MaxOdds:  value.maxOdds,
      EVI: value.evFilterValueI,
      EVII: value.evFilterValueII,
      MRI: value.matchRatingFilterI,
      MRII: value.matchRatingFilterII,
      SSI: value.secretSauceI,
      SSII: value.secretSauceII,
      Filter: value.isEvSelected,
      Audio: value.isAudioEnabled
    });
  }

  saveUserSettings(){
    this.userPropertiesService.saveUserSettings(this.settingsForm.value);
  }
}

