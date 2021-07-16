import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupCookiePolicyComponent } from '../popup-cookie-policy/popup-cookie-policy.component';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.css']
})
export class TermsOfUseComponent implements OnInit {

  constructor(public dialog:MatDialog) { }

  ngOnInit(): void {
  }

  popupCookieDialog(){
    this.dialog.open(PopupCookiePolicyComponent, {panelClass:'about-dialog'});
  }

}
