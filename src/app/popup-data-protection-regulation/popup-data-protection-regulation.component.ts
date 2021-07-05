import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TermsOfUseComponent } from '../terms-of-use/terms-of-use.component';

@Component({
  selector: 'app-popup-data-protection-regulation',
  templateUrl: './popup-data-protection-regulation.component.html',
  styleUrls: ['./popup-data-protection-regulation.component.css']
})
export class PopupDataProtectionRegulationComponent implements OnInit {
  checked:boolean;

  constructor(public dialog:MatDialog) { }

  ngOnInit(): void {
    this.checked=false;
  }

  openTermsAndConditions(){
    this.dialog.open(TermsOfUseComponent);
  }

}
