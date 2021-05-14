import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ActiveBet } from '../models/active-bet.model'
import { SavedActiveBetsService } from '../services/saved-active-bets.service';
import { Subscription } from 'rxjs';

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

export class ActiveBetsComponent implements OnInit {
  constructor(private sabServices: SavedActiveBetsService ) { }
  ACTIVE_BETS: ActiveBet[]=[];
  activeBetsSubscription: Subscription;
  dataSource: ActiveBet[];

  columnsToDisplay = ['created', 'fixture', 'selection', 'matchDetail', 'backOdd', 'stake', 'layOdd', 'layStake', 'ql', 'betState', 'isSettled'];

  expandedElement: ActiveBet[] | null;


  ngOnInit(): void {

    //init sab array to db query
    this.ACTIVE_BETS = this.sabServices.getActiveBets();
    //catch async db query to array. assign to table
    this.activeBetsSubscription = this.sabServices.getsabUpdatedListener().subscribe( (db_sabs) => {
      this.ACTIVE_BETS = db_sabs
      this.dataSource = this.ACTIVE_BETS;
    })

    //catch any sabs created during session, push to an array.
    this.sabServices.sabListChange.subscribe( (sabArray: ActiveBet) =>{
      this.ACTIVE_BETS.push(sabArray);
      this.dataSource = this.ACTIVE_BETS;
    });

  }


  refreshSABList():void{
    this.dataSource=this.ACTIVE_BETS;
  }

  test(){
    console.log("Hi");

  }
}




