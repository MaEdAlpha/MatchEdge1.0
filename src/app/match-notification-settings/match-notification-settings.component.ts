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
                               MinOdds: new FormControl( this.userPropertiesService.getUserSettings().filters.viewTable.minOdds),
                               MaxOdds: new FormControl( this.userPropertiesService.getUserSettings().filters.viewTable.maxOdds),
                               EVI: new FormControl(this.userPropertiesService.getUserSettings().filters.viewTable.evFilterValueI),
                               EVII: new FormControl(this.userPropertiesService.getUserSettings().filters.viewTable.evFilterValueII),
                               MRI: new FormControl(this.userPropertiesService.getUserSettings().filters.viewTable.matchRatingFilterI),
                               MRII: new FormControl(this.userPropertiesService.getUserSettings().filters.viewTable.matchRatingFilterII),
                               SSI: new FormControl(this.userPropertiesService.getUserSettings().filters.viewTable.secretSauceI),
                               SSII: new FormControl(this.userPropertiesService.getUserSettings().filters.viewTable.secretSauceII),
                               Filter: new FormControl(this.userPropertiesService.getUserSettings().filters.viewTable.isEvSelected),
                               Audio: new FormControl(this.userPropertiesService.getUserSettings().filters.viewTable.audioEnabled),
        })
      });
  }

  onSubmitTrigger(fTriggerData: NgForm)
  {
    // Save all forms that have come back validated.
  }

  test(){
    console.log(this.settingsForm);
  }

  updatePreferenceChanges(value: any){
    console.log("Change detected in parent");

    console.log(value);

  }
}
