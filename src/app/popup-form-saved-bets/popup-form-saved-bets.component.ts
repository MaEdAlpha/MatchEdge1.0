import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActiveBet } from '../models/active-bet.model';
import { SavedActiveBetsService } from '../popup-view-saved-bets/saved-active-bets.service';

@Component({
  selector: 'app-popup-form-saved-bets',
  templateUrl: './popup-form-saved-bets.component.html',
  styleUrls: ['./popup-form-saved-bets.component.css']
})
export class PopupFormSavedBetsComponent implements OnInit {
  sabList: ActiveBet[]=[];
  sabControl = new FormControl();
  isEdit:boolean;

  constructor(private chRef: ChangeDetectorRef, public dialogRef: MatDialogRef<PopupFormSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService ) {
      console.log("In Form Saved List.");

      console.log(data);
       this.sabList = this.savedActiveBetService.getSelectionSAB(this.data.activeBet);
       this.isEdit = data.isEdit;
       console.log(this.sabList);

     }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.chRef.detectChanges();
  }

  onNoClick():void {
    this.dialogRef.close();
  }

}
