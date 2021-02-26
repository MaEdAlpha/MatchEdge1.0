import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserPropertiesService } from './user-properties.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationBoxService {

  constructor(private toast: ToastrService, private userPropService: UserPropertiesService) { }

  showNotification(){
    this.toast.success('Toastr Working', 'title');
  }

  enableToggleToast(){
    this.toast.error('Re-Enable toggle to view League Matches.')
  }

  showJuicyNotification(streamMatchesArray: any){
    var matchRatingFilter = this.userPropService.getMR();
    var evRatingFilter = this.userPropService.getEV();
    var home = streamMatchesArray[0];
    var away = streamMatchesArray[1];
    //Need to check if already in Juicy Matches. if()
    if(home.EVthisBet >= evRatingFilter || home.MatchRating >= matchRatingFilter){
      this.toast.info(home.Selection + ": \nEV: " + home.EVthisBet + "\n MR: " + home.MatchRating, "Juicy Match Detected!")

    }

    if(away.EVthisBet >= evRatingFilter || away.MatchRating >= matchRatingFilter){
      this.toast.success(away.Selection + ": \nEV: " + away.EVthisBet + "\n MR: " + away.MatchRating, "Juicy Match Detected!")
    }

  }
}
