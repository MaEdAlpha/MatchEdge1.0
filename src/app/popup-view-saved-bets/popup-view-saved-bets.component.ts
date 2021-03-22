import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SavedActiveBetsService } from './saved-active-bets.service';

@Component({
  selector: 'app-popup-view-saved-bets',
  templateUrl: './popup-view-saved-bets.component.html',
  styleUrls: ['./popup-view-saved-bets.component.css']
})
export class PopupViewSavedBetsComponent implements AfterViewInit {
  importedSabList: any [] = [];
  isEmptyList: boolean = true;
  constructor( public dialogRef: MatDialogRef<PopupViewSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService, private chRef: ChangeDetectorRef) {
      this.importedSabList = this.savedActiveBetService.getSabList();
    }

    ngAfterViewInit(){
      this.importedSabList.length == 0 ? this.isEmptyList = true : this.isEmptyList = false;
      this.chRef.detectChanges();
    }
    onNoClick(): void {
      this.dialogRef.close();
    }

    editDeleteSab(activeBet:any): void {
      console.log(activeBet);

    }

  }

