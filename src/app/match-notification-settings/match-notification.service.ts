import { Injectable } from '@angular/core';
import { TriggerOdds } from './trigger-odds.model';
import  { UserPropertiesService } from '../user-properties.service';
@Injectable({
  providedIn: 'root'
})
export class MatchNotificationService {

  constructor( private userPropService: UserPropertiesService) { }

  returnTriggerOdds() {
    //get from userProperies service?
    console.log("In matchNotifServices" + this.userPropService.getTriggerOdds());
    return this.userPropService.getTriggerOdds();
  }

  updateTriggOdds() {

  }


}
