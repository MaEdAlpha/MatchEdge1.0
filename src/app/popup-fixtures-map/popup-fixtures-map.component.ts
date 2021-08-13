import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-fixtures-map',
  templateUrl: './popup-fixtures-map.component.html',
  styleUrls: ['./popup-fixtures-map.component.css']
})
export class PopupFixturesMapComponent implements OnInit {
  guide:string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,) {
    this.guide = data.userGuide;
   }

  ngOnInit(): void {
  }

}
