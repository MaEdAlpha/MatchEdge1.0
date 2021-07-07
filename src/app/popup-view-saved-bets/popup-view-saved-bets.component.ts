import { AfterViewInit, ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ActiveBet } from '../models/active-bet.model';
import { PopupFormSavedBetsComponent } from '../popup-form-saved-bets/popup-form-saved-bets.component';
import { NotificationBoxService } from '../services/notification-box.service';
import { SavedActiveBetsService } from '../services/saved-active-bets.service';
import { UserPropertiesService } from '../services/user-properties.service';

@Component({
  selector: 'app-popup-view-saved-bets',
  templateUrl: './popup-view-saved-bets.component.html',
  styleUrls: ['./popup-view-saved-bets.component.css']
})
export class PopupViewSavedBetsComponent implements AfterViewInit {
  filteredSabList: ActiveBet [] = [];
  activeBetSubscription: Subscription;
  importedSabList: ActiveBet[] = [];
  userCommission: number;
  //masterList

  //selectionsList
  isEmptySelectionList: boolean = true;
  constructor( private userPropService: UserPropertiesService,
               private notificationBoxService: NotificationBoxService,
               public dialog: MatDialog,
               public dialogRef: MatDialogRef<PopupViewSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService, private chRef: ChangeDetectorRef) {
      //gets master list of all SAB
      this.importedSabList = this.data.list;
      console.log(this.importedSabList);

      //filter based off of selection.
      this.filteredSabList = this.filterList(data);

      //Refresh list for any newly added SAB
      // this.savedActiveBetService.sabListChange.subscribe( () => {
      //   //find only SAB to show for that selection.
      //  this.filteredSabList = this.importedSabList.filter(sab => {
      //   if (sab.selection == data.row.Selection) {
      //     return true;
      //   } else {
      //     return false;
      //   }

      // });
      //  this.checkIfEmpty();
      // //  this.chRef.detectChanges();
      // });

      //Update list for any deleted SAB
      this.savedActiveBetService.removeFromList.subscribe( ()=> {

        this.filteredSabList = this.filterList(data);
        this.checkIfEmpty();
      });
    }

    ngOnInit(){
      this.activeBetSubscription = this.savedActiveBetService.getSabListObservable().subscribe( addNewSAB => {
        this.filteredSabList.push(addNewSAB);
        this.checkIfEmpty();
      });
    }

  private filterList(data: any): ActiveBet[] {
    return  this.importedSabList.filter(sab => {
      if (sab.selection == data.row.Selection) {
        return true;
      }
    });
  }

    ngAfterViewInit(){
      this.checkIfEmpty();
      this.chRef.detectChanges();
    }

    // check if filterd list is empty, to toggle Template ' No SAB bets for this selection '
  private checkIfEmpty() {
    this.filteredSabList.length == 0 || this.filteredSabList == undefined ? this.isEmptySelectionList = true : this.isEmptySelectionList = false;
    this.chRef.detectChanges();
  }

    onNoClick(): void {
      this.dialogRef.close();
    }

    showMe(sab:any){
      console.log(sab);

    }
    //need match State.
    onAddClick(isEdit:boolean):void {
      console.log(this.data);
      let ftaOption = this.userPropService.getFTAOption();
      var activeBet: ActiveBet = {
        id:null,
        juId: this.userPropService.getUserId(),
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
        isBrkzFTA: ftaOption == 'generic' ? 0 : 1,
      }
      //Change back to height='60%' for both
      const dialogRef = this.dialog.open(PopupFormSavedBetsComponent, {
        height: '40%',
        width:'100%',
        panelClass: 'saved-active-bets-responsive-view',
        data: {activeBet, isEdit}
      });

      dialogRef.afterClosed().subscribe( result => {
        console.log('Form closed');

      })

    }

    editDeleteSab(activeBet:ActiveBet, isEdit:boolean): void {
      console.log(activeBet);
      //pass in boolean on whether its an edit, or a manually added active bet
      //Brooks note: access to Popup Overlays
      const dialogRef = this.dialog.open(PopupFormSavedBetsComponent, {
        height: '40%',
        width:'100%',
        panelClass: 'saved-active-bets-responsive-view',
        data: {activeBet, isEdit}
      });

      dialogRef.afterClosed().subscribe( result => {
        console.log('Form closed');

      });
    }

    deleteSab(activeBet: ActiveBet){
      console.log(activeBet);
      console.log(this.importedSabList);

      this.importedSabList.filter( sab => {
        if(sab.id == activeBet.id){
          console.log("FOUND!!!");
          var index = this.importedSabList.indexOf(sab);
          this.importedSabList.splice(index, 1);
          return true;
        };
      });
      this.savedActiveBetService.deleteSAB(activeBet.id);
      this.notificationBoxService.DeleteToastSAB();
      this.checkIfEmpty()

    }

  }

