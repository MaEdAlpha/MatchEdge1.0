import { AfterViewInit, Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ActiveBet } from '../models/active-bet.model'
import { SavedActiveBetsService } from '../services/saved-active-bets.service';
import { Subscription } from 'rxjs';
import { FormControl,FormGroup,FormArray } from '@angular/forms';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}

@Component({
  selector: 'app-active-bets',
  templateUrl: './active-bets.component.html',
  styleUrls: ['./active-bets.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ActiveBetsComponent implements OnInit, AfterViewInit {
  constructor(private sabServices: SavedActiveBetsService ) { }
  ACTIVE_BETS: ActiveBet[]=[];
  activeBetsSubscription: Subscription;
  dataSource: ActiveBet[];
  noMatchesToDisplay:boolean=true;
  expandedElement: ActiveBet[] | null;
  sabSource: FormArray;

  columnsToDisplay = ['created', 'fixture', 'selection', 'matchDetail', 'backOdd', 'stake', 'layOdd', 'layStake', 'ql', 'isSettled', 'delete'];

  selectionValues: FormGroup;
  PandLform: FormGroup;

  ngOnInit(): void {

    //init sab array to db query
    this.ACTIVE_BETS = this.sabServices.getActiveBets();
    //init sabSource for expansion container
    //catch async db query to array. assign to table
    this.activeBetsSubscription = this.sabServices.getsabUpdatedListener().subscribe( (db_sabs) => {
      this.ACTIVE_BETS = db_sabs
      this.dataSource = this.ACTIVE_BETS;
      this.sabSource = new FormArray(this.ACTIVE_BETS.map( sab => this.createForm(sab)));
    });

    this.PandLform = new FormGroup(
      {
        ProfitLoss: new FormControl('')
      }
    );

    //catch any sabs created during session, push to an array.
    this.sabServices.sabListChange.subscribe( (sabArray: ActiveBet) =>{
      this.ACTIVE_BETS.push(sabArray);
      this.dataSource = this.ACTIVE_BETS;
      this.sabSource = new FormArray(this.ACTIVE_BETS.map( sab => this.createForm(sab)));
    });

  }

  ngAfterViewInit(){
    this.sabSource = new FormArray(this.ACTIVE_BETS.map( x=> this.createForm(x) ) );
    console.log("SAB SOURCE");
    console.log(this.sabSource);


  }

  createForm(sab:any)
  {
    return new FormGroup(
      {
      Stake:new FormControl(sab.stake),
      LayStake:new FormControl(sab.backOdd / sab.layOdd * sab.stake),
      BackOdds:new FormControl(sab.backOdd),
      LayOdds:new FormControl(sab.layOdd),
      MatchInfo: new FormControl(sab.comment),
      });
  }

  showSelectionValues(sab: any, index: number){
    console.log(index);
    console.log(sab);

    var data: FormGroup = this.getGroup(index);
    console.log(data);
    data.setValue({
      Stake: sab.stake,
      LayStake: sab.layStake,
      BackOdds: sab.backOdd,
      LayOdds: sab.layOdd,
      MatchInfo: sab.comment,
    });
    //use a method to reset the formGroup values to selectionObject values.
  }

  getGroup(index:number)
  {
    // console.log("GETTING GROUP");

    //console.log(this.dataSource.at(index) as FormGroup);
    return this.sabSource.at(index) as FormGroup
  }

  loadGroup(i:number){
    this.selectionValues = this.getGroup(i);
  }

  getErrorMessage() {
    var formInput = this.selectionValues.controls;
    console.log(formInput);

    // if(formInput.minOdds.errors || formInput.maxOdds.errors || formInput.evFilterValueI.errors || formInput.evFilterValueII.errors || formInput.matchRatingFilterI.errors || formInput.matchRatingFilterII.errors || formInput.secretSauceI.errors || formInput.secretSauceII.errors){
    //   return 'Invalid entry, please enter a valid number'
    // }
  }

  savePL(sab:ActiveBet){
    console.log("PL Captured!!");
    if(this.PandLform.value.ProfitLoss == "")
    {
      console.log("Registered as Empty, use QL stored value as P&L property!");
      sab.pl = sab.ql;

    } else {
      sab.pl = +this.PandLform.value.ProfitLoss;
    }
    this.PandLform.value.Profitloss = "";
    console.log("Updated! PL stored as: " + sab.pl);

  }

  deleteSAB(sab: ActiveBet){
    console.log(sab);

  }


  LayStake(backOdds: number, layOdds:number, steakYum: number):number{
    var laySteak = (+backOdds / +layOdds)* +steakYum;
  return laySteak;
  }

FTA(stake:number, backOdds: number, layOdds:number):number{
  var layStake = (+backOdds / +layOdds) * +stake;
  return (+stake * (+backOdds - 1) + +layStake);
}

TotalEV(occurence:number, stake:number, backOdds:number, layOdds:number):number{
  var layStake = (+backOdds / +layOdds) * +stake;
  var result:number = +(+stake * (+backOdds - 1) + +layStake)+ (+layStake- +stake)*(+occurence-1);
  return result;
}

NewMatchRating(backOdds:number, layOdds:number){
  return +(backOdds/layOdds)*100;
}

NewSS(backOdds:number,layOdds:number,stake:number){
  var fta = this.FTA(stake, backOdds, layOdds);
  var ql = this.QL(backOdds, layOdds, stake);
  var qlPercentage = +(ql/fta*100).toFixed(2);
  return qlPercentage;
}

ROI(stake:number, backOdds: number, layOdds:number, occurence:number):number{
  var layStake = (+backOdds / +layOdds) * +stake;
  var fullTurnAround = +stake * (+backOdds -1) + +layStake;
  var ql = +(+layStake- +stake);
  var evTotal = +(fullTurnAround + ( +ql * (+occurence -1)));
  var evThisBet = + (evTotal / occurence );

  return +((evThisBet/stake)*100);
}

QL(backOdds: number, layOdds:number, stake:number){
  var layStake = (+backOdds / +layOdds) * stake;
  return +(+layStake - +stake);
}

Liability(layOdds:number, layStake:number):number {
  return +(+layOdds - 1 )* +layStake;
}



}




