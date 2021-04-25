import { Component, EventEmitter, Output } from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Output() notificationSettings = new EventEmitter<boolean>();
  displayNotification: boolean;

  ngOnInit() {
    this.displayNotification = false;
  }

  notificSettingsClicked(_displayNotification:boolean){
      this.notificationSettings.emit(_displayNotification);
  }

  //TODO
  // Add attribute directive to listen for ESC key to change displayNotificatin to false
}
