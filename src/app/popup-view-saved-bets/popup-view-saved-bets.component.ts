import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
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
  filteredSabList: ActiveBet [] = [];
  activeBetSubscription: Subscription;
  importedSabList: ActiveBet[] = []
  //masterList

  //selectionsList
  isEmptySelectionList: boolean = true;
  constructor( public dialog: MatDialog, public dialogRef: MatDialogRef<PopupViewSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService, private chRef: ChangeDetectorRef) {
      //gets master list of all SAB

      this.importedSabList = this.data.list;

      this.filteredSabList = this.importedSabList.filter(sab => {
        if (sab.selection == data.row.Selection) {
          return true;
        }
      });

      this.savedActiveBetService.sabListChange.subscribe( (updatedSABList:ActiveBet) => {
        console.log("Change detected!");

       this.filteredSabList = this.importedSabList.filter(sab => {
        if (sab.selection == data.row.Selection) {
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
    this.filteredSabList.length == 0 && this.filteredSabList != undefined ? this.isEmptySelectionList = true : this.isEmptySelectionList = false;
  }

    onNoClick(): void {
      this.dialogRef.close();
    }

    //need match State.
    onAddClick(isEdit:boolean):void {
      console.log(this.data);

      var activeBet: ActiveBet = {
        id:null,
        created: Date.now(),
        fixture: this.data.row.Home + " vs " + this.data.row.Away,
        selection: this.data.row.Selection,
        logo: this.data.row.Selection.toLowerCase().split(' ').join('-'),
        matchDetail: this.data.row.EpochTime*1000,
        stake: null,
        backOdd: null,
        layOdd: null,
        layStake: null,
        liability: null,
        ev: null,
        mr: null,
        sauce: null,
        fta: null,
        ql: null,
        roi: null,
        betState:false,
        occ: this.data.row.Selection == this.data.row.Home ? this.data.row.OccH: this.data.row.OccA,
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

