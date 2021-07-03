import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserPropertiesService } from '../services/user-properties.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnChanges {
  constructor(private userService: UserPropertiesService){};
  @Input() displayNotification:boolean;
  @Input() displayActivated: boolean;
  @Output() notificationSettings = new EventEmitter<boolean>();
  enableDisplaySettings: boolean;

  ngOnChanges(simpleChange: SimpleChanges){
    if(simpleChange.displayActivated){
      console.log("ONNGONCHANGES");

      this.enableDisplaySettings = this.displayActivated;
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
    console.log("HEADER CMPONENT TOGGLED!");

    this.displayNotification = event;
  }



  test(){
    console.log(this.userService.getToken());
  }
  //TODO
  // Add attribute directive to listen for ESC key to change displayNotificatin to false
}
