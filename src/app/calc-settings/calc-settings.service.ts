import { Injectable } from '@angular/core';
import { UserPropertiesService } from '../user-properties.service';

@Injectable({
  providedIn: 'root'
})
export class CalcSettingsService {

  constructor(private userPropertiesService: UserPropertiesService) { }

  getUserStakes()
  {
   return this.userPropertiesService.accessUserStakes();
  }
}
