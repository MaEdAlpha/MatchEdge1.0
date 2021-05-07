import { Component, EventEmitter, Input, Output } from '@angular/core';
import {RouterModule} from '@angular/router';
import { UserPropertiesService } from '../services/user-properties.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private userService: UserPropertiesService){};
  @Input() displayNotification:boolean;
  @Output() notificationSettings = new EventEmitter<boolean>();


  ngOnInit() {
    this.displayNotification = false;
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
