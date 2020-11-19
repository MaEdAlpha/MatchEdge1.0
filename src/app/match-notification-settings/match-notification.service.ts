import { Injectable } from '@angular/core';
import { TriggerOdds } from './trigger-odds.model';
import  { UserPropertiesService } from '../user-properties.service';
@Injectable({
  providedIn: 'root'
})
export class MatchNotificationService {

  constructor( public userPropService: UserPropertiesService) { }

  returnTriggerOdds() {
    //get from userProperies service?
    this.userPropService.getTriggerOdds();
  }

  updateTriggOdds() {

  }


}
