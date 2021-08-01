import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-confirm-cancellation',
  templateUrl: './popup-confirm-cancellation.component.html',
  styleUrls: ['./popup-confirm-cancellation.component.css']
})
export class PopupConfirmCancellationComponent implements OnInit {
  expiration:string;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any ) {
    this.expiration = data.expiry;
   }

  ngOnInit(): void {

  }

}
