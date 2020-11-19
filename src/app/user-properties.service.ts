import { Injectable } from '@angular/core';
import { UserProperties } from './user-properties.model';
import { TriggerOdds } from './match-notification-settings/trigger-odds.model';

@Injectable({
  providedIn: 'root'
})
export class UserPropertiesService {

  triggerOdds: TriggerOdds[] = [
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99 },
    {start: 9.99, finish: 9.99}
  ];

  defaultOdds: TriggerOdds[] = [
    {start: 1.50, finish: 1.52 },
    {start: 1.74, finish: 1.77 },
    {start: 2, finish: 2.04 },
    {start: 2.46, finish: 2.52 },
    {start: 2.82, finish: 2.9 },
    {start: 3.2, finish: 3.3 },
    {start: 4.5, finish: 4.7 },
    {start: 5.4, finish: 5.7 },
    {start: 6.2, finish: 6.6 },
    {start: 7.6, finish: 8.2 },
    {start: 8.8, finish: 9.6 },
    {start: 10, finish: 11 },
    {start: 14, finish: 16}
  ];

  constructor(userProperties: UserProperties) { }

  getUserProperties() {
    //http request to retrieve user properties from DB;
  }

  getTriggerOdds(){
    if(this.triggerOdds != null)
    {
      return this.triggerOdds;
    } else {
      return this.defaultOdds;
    }
  }
}
