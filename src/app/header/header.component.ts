import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatchesService } from '../match/matches.service';
import { UserPropertiesService } from '../services/user-properties.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnChanges {
  constructor(private userService: UserPropertiesService, private router: Router, private matchServices: MatchesService, private chRef: ChangeDetectorRef){};
  @Input() displayNotification:boolean;
  @Input() displayActivated: boolean;
  @Input() showSubscriptionButton: boolean;
  @Output() notificationSettings = new EventEmitter<boolean>();
  enableDisplaySettings: boolean;

  ngOnChanges(simpleChange: SimpleChanges){
    if(simpleChange.displayActivated){
      //Enables ability to open UserSettings upon entering website.
      this.enableDisplaySettings = this.displayActivated;
    }
    if(simpleChange.showSubscriptionButton && simpleChange.showSubscriptionButton.currentValue){
      console.log(this.showSubscriptionButton);
      console.log("SUBBUTTON WTF");
      this.chRef.detectChanges();
    }
  }

  ngOnInit() {
    this.displayNotification = false;
    this.enableDisplaySettings = false;
  }

  notificSettingsClicked(_displayNotification:boolean){
      this.notificationSettings.emit(_displayNotification);
  }

  toggleNotificationSettings(event){
    //Toggles user setting window
    this.displayNotification = event;
  }

  test(){
    console.log(this.userService.getToken());
  }

  goToSubscriptions(){
    this.displayNotification = false;
    this.enableDisplaySettings = false;
    this.displayActivated = false;
    this.matchServices.openSubscriptions();

      // this.router.navigate(['/']);
  }
}
