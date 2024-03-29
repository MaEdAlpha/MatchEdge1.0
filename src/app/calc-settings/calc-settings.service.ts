import { Injectable } from '@angular/core';
import { UserPropertiesService } from '../services/user-properties.service';
import { CalcSettings } from './calc-settings.model';

@Injectable({
  providedIn: 'root'
})
export class CalcSettingsService {

  constructor(private userPropertiesService: UserPropertiesService) { }

  getUserStakes()
  {
   return this.userPropertiesService.accessUserStakes();
  }

  getRanges() {
    return this.userPropertiesService.accessOddsRange();
  }

  getOddsRangeUpperLimit():number[]{
    return this.userPropertiesService.accessOddsRangeUpperLimit();
  }

  saveToUserProfile(calcPref: CalcSettings[]) {
    this.userPropertiesService.saveCalcSettings(calcPref);
  }

  getPrefferedStake( backOdds:number){
    var backLay: number;
    this.userPropertiesService.getUserStakePreferences()
    .forEach( (oneOfthese: CalcSettings) => {
      if(backOdds >= oneOfthese.oddsLow && backOdds <= oneOfthese.oddsHigh){
        backLay = oneOfthese.stake;
      }
    });
    return backLay;
  }

}
