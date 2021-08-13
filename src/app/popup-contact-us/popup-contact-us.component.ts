import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PopupLoginMessageComponent } from '../popup-login-message/popup-login-message.component';
import { PopupQuickReferenceGuideComponent } from '../popup-quick-reference-guide/popup-quick-reference-guide.component';
import { PopupTwoUpProductComponent } from '../popup-two-up-product/popup-two-up-product.component';

@Component({
  selector: 'app-popup-contact-us',
  templateUrl: './popup-contact-us.component.html',
  styleUrls: ['./popup-contact-us.component.css']
})
export class PopupContactUsComponent implements OnInit {
  visitorHasAccess:boolean;
  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any, ) {
    this.visitorHasAccess = data.hasAccess;
   }

  ngOnInit(): void {

  }

  popupInfo(option:number):void{
    if(this.visitorHasAccess) { 
      // option == 0 ?  this.dialog.open(PopupTwoUpProductComponent, {panelClass:'two-up-product'}) : this.dialog.open(PopupQuickReferenceGuideComponent, {panelClass:'quick-reference-guide'})
    } else {
      this.dialog.open(PopupLoginMessageComponent, {panelClass:'login-message'})
    }
  }
}
