import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';
import { PopupFormSavedBetsComponent } from '../popup-form-saved-bets/popup-form-saved-bets.component';
import { SavedActiveBetsService } from '../services/saved-active-bets.service';

@Component({
  selector: 'app-popup-view-saved-bets',
  templateUrl: './popup-view-saved-bets.component.html',
  styleUrls: ['./popup-view-saved-bets.component.css']
})
export class PopupViewSavedBetsComponent implements AfterViewInit {
  importedSabList: ActiveBet [] = [];
  filteredSabList: ActiveBet [] = [];
  activeBetSubscription: Subscription;
  //masterList

  //selectionsList
  isEmptySelectionList: boolean = true;
  constructor( public dialog: MatDialog, public dialogRef: MatDialogRef<PopupViewSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService, private chRef: ChangeDetectorRef) {
      //gets master list of all SAB

      this.importedSabList = this.savedActiveBetService.getSabList();

      this.filteredSabList = this.importedSabList.filter(sab => {
        if (sab.selection == data.Selection) {
          return true;
        }
      });

      this.savedActiveBetService.sabListChange.subscribe( updatedSABList => {
        console.log("Change detected!");

       this.importedSabList = updatedSABList;

       this.filteredSabList = this.importedSabList.filter(sab => {
        if (sab.selection == data.Selection) {
          return true;
        }
        });

       this.checkIfEmpty();
       this.chRef.detectChanges();
      });

    }

    ngAfterViewInit(){
      this.checkIfEmpty();
      this.chRef.detectChanges();
    }
  private checkIfEmpty() {
    this.filteredSabList.length == 0 ? this.isEmptySelectionList = true : this.isEmptySelectionList = false;
  }

    onNoClick(): void {
      this.dialogRef.close();
    }

    //need match State.
    onAddClick(isEdit:boolean):void {
      console.log(this.data);

      var activeBet: ActiveBet = {
        created: Date.now(),
        fixture: this.data.Home + " vs " + this.data.Away,
        selection: this.data.Selection,
        logo: this.data.Selection.toLowerCase().split(' ').join('-'),
        matchDetail: this.data.EpochTime*1000,
        stake: null,
        backOdd: null,
        layOdd: null,
        layStake: null,
        liability: null,
        ev: null,
        fta: null,
        ql: null,
        roi: null,
        betState:false,
        occ: this.data.Selection == this.data.Home ? this.data.OccH: this.data.OccA,
        pl: null,
        comment: ' ',
        isSettled: false,
      }

      const dialogRef = this.dialog.open(PopupFormSavedBetsComponent, {
        width: '40%',
        height: '80%',
        data: {activeBet, isEdit}
      });

      dialogRef.afterClosed().subscribe( result => {
        console.log('Form closed');

      })

    }

    editDeleteSab(activeBet:ActiveBet, isEdit:boolean): void {
      console.log(activeBet);
      //pass in boolean on whether its an edit, or a manually added active bet

      const dialogRef = this.dialog.open(PopupFormSavedBetsComponent, {
        width: '40%',
        height: '80%',
        data: {activeBet, isEdit}
      });

      dialogRef.afterClosed().subscribe( result => {
        console.log('Form closed');

      })
    }

  }

