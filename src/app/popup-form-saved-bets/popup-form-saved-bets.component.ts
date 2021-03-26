import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
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
  dataSource: any;

  sabFormValues: FormGroup;

  constructor(private chRef: ChangeDetectorRef, public dialogRef: MatDialogRef<PopupFormSavedBetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private savedActiveBetService: SavedActiveBetsService ) {
      console.log("In Form Saved List.");
      this.sabList = this.savedActiveBetService.getSelectionSAB(this.data.activeBet);
      this.isEdit = data.isEdit;
      this.dataSource = new FormArray(this.data.activeBet.map( data => this.createForm(data)));
     }

  private createForm(data: any) {
    this.sabFormValues = new FormGroup({
      Stake: new FormControl(data.activeBet.stake),
      LayStake: new FormControl(data.activeBet.backOdd / data.activeBet.layOdd * data.activeBet.stake),
      BackOdds: new FormControl(data.activeBet.backOdd),
      LayOdds: new FormControl(data.activeBet.layOdd),
    });


  }

  ngOnInit(): void {



    console.log(this.data);

    console.log(this.sabList);
  }

  ngAfterViewInit(){
    this.chRef.detectChanges();
  }

  onNoClick():void {
    this.dialogRef.close();
  }

  getLayStake(backOdds:number, layOdds:number, stake:number):number {
    var layStake = (+backOdds / +layOdds)* +stake;
    return layStake;
  }

}
