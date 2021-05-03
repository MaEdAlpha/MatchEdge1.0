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

  constructor(private userPropertiesService: UserPropertiesService) { }

  ngOnInit(): void {
    //if user does not have commission saved then use default
    console.log("OnInitCalled in MatchNotif-Settings");

    this.smCommission = this.userPropertiesService.getCommission();

        //Creat a settings form, then pass down to all the child components in HTML
      this.settingsForm = new FormGroup({
        account: new FormGroup({
                                UserName: new FormControl(this.userPropertiesService.getUserSettings().account.username),
                                FirstName: new FormControl(this.userPropertiesService.getUserSettings().account.firstName),
                                LastName: new FormControl(this.userPropertiesService.getUserSettings().account.lastName),
                                Email: new FormControl(this.userPropertiesService.getUserSettings().account.email),
                                Quote: new FormControl(this.userPropertiesService.getUserSettings().account.quote),

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
                                minOdds: new FormControl( this.userPropertiesService.getUserSettings().filters.minOdds),
                                maxOdds: new FormControl( this.userPropertiesService.getUserSettings().filters.maxOdds),
                                evFVI: new FormControl(this.userPropertiesService.getUserSettings().filters.evFVI),
                                evFVII: new FormControl(this.userPropertiesService.getUserSettings().filters.evFVII),
                                matchRatingFilterI: new FormControl(this.userPropertiesService.getUserSettings().filters.matchRatingFilterI),
                                matchRatingFilterII: new FormControl(this.userPropertiesService.getUserSettings().filters.matchRatingFilterII),
                                secretSauceI: new FormControl(this.userPropertiesService.getUserSettings().filters.secretSauceI),
                                secretSauceII: new FormControl(this.userPropertiesService.getUserSettings().filters.secretSauceII),
                                fvSelected: new FormControl(this.userPropertiesService.getUserSettings().filters.fvSelected),
                                audioEnabled: new FormControl(this.userPropertiesService.getUserSettings().filters.audioEnabled),
                                })
      });
  }

  test(){
    console.log(this.settingsForm.value);

  }

  updateAccountChanges(value:any){
    this.settingsForm.controls['account'].setValue({
      UserName: value.UserName,
      FirstName: value.FirstName,
      LastName: value.LastName,
      Email: value.Email,
      Quote: value.Quote,
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
      minOdds: value.minOdds,
      maxOdds:  value.maxOdds,
      evFVI: value.evFilterValueI,
      evFVII: value.evFilterValueII,
      matchRatingFilterI: value.matchRatingFilterI,
      matchRatingFilterII: value.matchRatingFilterII,
      secretSauceI: value.secretSauceI,
      secretSauceII: value.secretSauceII,
      fvSelected: value.fvSelected,
      audioEnabled: value.audioEnabled
    });
  }

  saveUserSettings(){
    console.log("SAVING TO DB");
    //Update Change detection in Juicy Table.
    this.userPropertiesService.setFormValues(this.settingsForm.value.filters);
    this.userPropertiesService.saveUserSettings(this.settingsForm.value, this.userPropertiesService.getUserSettings().juicyId );
  }
}

