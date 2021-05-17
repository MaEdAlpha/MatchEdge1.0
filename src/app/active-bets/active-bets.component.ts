import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ActiveBet } from '../models/active-bet.model'
import { SavedActiveBetsService } from '../services/saved-active-bets.service';
import { Subscription } from 'rxjs';
import { FormControl,FormGroup,FormArray } from '@angular/forms';
import { NotificationBoxService } from '../services/notification-box.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ArrayType } from '@angular/compiler';
import { MatSort, Sort } from '@angular/material/sort';

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

export class ActiveBetsComponent implements OnChanges, OnInit, AfterViewInit {
  constructor(private sabServices: SavedActiveBetsService, private notificationBoxService: NotificationBoxService, private chRef: ChangeDetectorRef ) { }
  ACTIVE_BETS: ActiveBet[]=[];
  @Input() tableSelected: number;
  activeBetsSubscription: Subscription;
  newActiveBetsSubscription: Subscription;
  dataSource: ActiveBet[] | any;
  sortedData: ActiveBet[];
  expandedElement: ActiveBet[] | null;
  sabSource: FormArray;
  isEmptySABList: boolean = false;
  columnsToDisplay = ['created', 'fixture', 'selection', 'matchDetail', 'backOdd', 'stake', 'layOdd', 'layStake', 'ql', 'isSettled', 'pl', 'delete'];

  selectionValues: FormGroup;
  PandLform: FormGroup;

  @ViewChild(MatTable, {static: false}) table : MatTable<ActiveBet> // initialize
  @ViewChild(MatSort) activeBetSort: MatSort;
  ngOnChanges(changes: SimpleChanges){
      if( changes.tableSelected.currentValue){

      }
  }

  ngOnInit(): void {
    console.log("SAB INITIALIZED");

    //init sab array to db query
    this.ACTIVE_BETS = this.sabServices.getActiveBets();
    //init sabSource for expansion container
    //catch async db query to array. assign to table
    this.activeBetsSubscription = this.sabServices.getsabUpdatedListener().subscribe( (db_sabs) => {

        this.ACTIVE_BETS = db_sabs
        this.sabSource = new FormArray(this.ACTIVE_BETS.map( sab => this.createForm(sab)));
        this.dataSource=[];
        this.dataSource= this.ACTIVE_BETS
        this.checkIfEmpty();

    });

    this.newActiveBetsSubscription = this.sabServices.getSabListObservable().subscribe( (newSabs) => {
        this.ACTIVE_BETS.push(newSabs);
        //get dupilcates from the observable due to async and juID property.
        this.dataSource = [];
        //filter out duplicates
        const nonDuplicates = this.ACTIVE_BETS.filter( (sab, index, array) => array.findIndex( obj => obj.created === sab.created ) === index);
        this.dataSource = nonDuplicates
        this.sabSource = new FormArray(nonDuplicates.map( sab => this.createForm(sab)));
        console.log("THIS DATASOURCE");

        console.log(this.dataSource);

        this.table.renderRows();
        this.checkIfEmpty();

    });

    this.PandLform = new FormGroup(
      {
        ProfitLoss: new FormControl("")
      }
    );
  }

  ngOnDestroy(){
    this.newActiveBetsSubscription.unsubscribe();
    this.activeBetsSubscription.unsubscribe();
  }

  ngAfterViewInit(){
    this.sabSource = new FormArray(this.ACTIVE_BETS.map( x=> this.createForm(x) ) );
    this.isEmptySABList = this.dataSource == undefined || this.dataSource.length  != 0 ? false:true;
    if(this.dataSource == undefined){
      console.log("Loading....");
    } else {
      this.dataSource.sort = this.activeBetSort;
    }
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
    console.log(this.PandLform);

    var message:string;
    if(this.PandLform.value.ProfitLoss == "" && sab.isSettled)
    {
      message = sab.pl == sab.ql ? 'Q/L stored as P/L' : 'P/L stored: ' + sab.pl;
      sab.pl = sab.ql;

      this.notificationBoxService.IncompleteSABToast(message);


    } else if(this.PandLform.value.ProfitLoss != "" && sab.isSettled) {
      sab.pl = +this.PandLform.value.ProfitLoss;
      //update DB
      this.notificationBoxService.IncompleteSABToast('Incompletedmethod')
      //disable this matInput
      //set style to change this row green.
    }
    console.log("saved!");

    console.log(sab);
    this.expandedElement = null;
    this.sabServices.patchToActiveBets(sab);
    this.PandLform.controls.ProfitLoss.setValue("");
  }

  deleteSAB(_sab: ActiveBet){
    console.log(_sab);
    var index:number;
    //filter out delted SAB, set new list.
    this.dataSource  =  this.ACTIVE_BETS.filter( sab => {
      if(sab.id == _sab.id){
        //store index
        index = this.ACTIVE_BETS.indexOf(sab);
        return false;
      } else {
        console.log(sab);

        return true;
      };
    });

    //remove from reference list.
    this.ACTIVE_BETS.splice(index, 1);
    //Delete in database.
    this.sabServices.deleteSAB(_sab.id);
    this.notificationBoxService.DeleteToastSAB();
    this.checkIfEmpty()
  }

//Sort
sortData(sort: Sort) {
  const data = this.ACTIVE_BETS.slice();
  if (!sort.active || sort.direction === '') {
    this.dataSource = data;
    return;
  }

  function compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  this.dataSource = data.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'created': return compare(a['created'], b['created'], isAsc);
      case 'matchDetail': return compare(a['matchDetail'], b['matchDetail'], isAsc);
      case 'selection': return compare(a['selection'], b['selection'], isAsc);
      case 'fixture': return compare(a['fixture'], b['fixture'], isAsc);
      default: return 0;
    }
  });
}
//Calculations
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


private checkIfEmpty() {
  this.dataSource.length == 0 || this.dataSource == undefined ? this.isEmptySABList = true : this.isEmptySABList = false;
  this.chRef.detectChanges();
}
}




