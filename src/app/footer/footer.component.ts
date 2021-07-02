import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupAboutUsComponent } from '../popup-about-us/popup-about-us.component';
import { PopupContactUsComponent } from '../popup-contact-us/popup-contact-us.component';
import { PrivacyContentComponent } from '../privacy-content/privacy-content.component';
import { TermsOfUseComponent } from '../terms-of-use/terms-of-use.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openDialog(option:number):void{
    option == 0 ? this.dialog.open(PopupAboutUsComponent, {panelClass: 'about-dialog'}) : this.dialog.open(PopupContactUsComponent, {panelClass: 'about-dialog'});
  }

  openTOU():void{
    this.dialog.open(TermsOfUseComponent, {panelClass:'about-dialog'});
  }

  openPrivacy():void{
    this.dialog.open(PrivacyContentComponent, {panelClass: 'about-dialog'});
  }

}
