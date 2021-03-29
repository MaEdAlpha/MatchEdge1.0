import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActiveBet } from '../models/active-bet.model';
import { PopupFormSavedBetsComponent } from '../popup-form-saved-bets/popup-form-saved-bets.component';
import { SavedActiveBetsService } from './saved-active-bets.service';

@Component({
  selector: 'app-popup-view-saved-bets',
  templateUrl: './popup-view-saved-bets.component.html',
  styleUrls: ['./popup-view-saved-bets.component.css']
})
export class PopupViewSavedBetsComponent implements AfterViewInit {
  importedSabList: ActiveBet [] = [];
  filteredSabList: ActiveBet [] = [];
  //masterList
  isEmptyList: boolean = true;
  //selectionsList
  isEmptySelectionList: boolean = true;
  constructor( public dialog: MatDialog, public dialogRef: MatDialogRef<PopupViewSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService, private chRef: ChangeDetectorRef) {
      //gets master list of all SAB
      this.importedSabList = this.savedActiveBetService.getSabList();

      //gets filtered based off of selection
      this.filteredSabList = this.importedSabList.filter(sab => {
        if(sab.selection == data.Selection){
          return true;
        }
      });

      console.log("Your Filtere SAB list");
      console.log(this.filteredSabList);

    }

    ngAfterViewInit(){
      this.filteredSabList.length == 0 ? this.isEmptySelectionList = true : this.isEmptySelectionList = false;
      this.chRef.detectChanges();
    }
    onNoClick(): void {
      this.dialogRef.close();
    }

    //need match State.
    onAddClick(isEdit:boolean):void {
      console.log(this.data);
      var activeBet: ActiveBet = {
        fixture: this.data.Fixture,
        selection: this.data.Selection,
        logo: this.data.Selection.toLowerCase().split(' ').join('-'),
        matchDetail: this.data.Details,
        stake: 0,
        backOdd: 0,
        layOdd: 0,
        layStake: 0,
        liability: 0,
        ev: 0,
        fta: 0,
        ql: 0,
        roi: 0,
        betState:false,
        occ: this.data.Selection == this.data.Home ? this.data.OccH: this.data.OccA,
        pl: 0,
      }

      const dialogRef = this.dialog.open(PopupFormSavedBetsComponent, {
        width: '33%',
        height: '66%%',
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

