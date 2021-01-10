import { Directive, Input, OnChanges, SimpleChanges, Renderer2, ElementRef } from '@angular/core';
import { TablePreferences } from '../user-properties.model';

@Directive({
  selector: '[appHideTableRow]'
})
export class HideTableRowDirective implements OnChanges{
  evValue: number;    //updated from mongoStreamWatch
  mrValue: number;    //match-rating value
  backOdds: number;   //backOdds
  inRange: boolean;   //is in Date Range
  @Input() ignore: boolean;    //ignore Status
  @Input() selection: any;
  @Input() userPref: TablePreferences;

  constructor(private renderer: Renderer2, private elRef: ElementRef) {  }

  ngOnChanges(changes: SimpleChanges){
    //Set values upon change.
    this.evValue = this.selection.EVthisBet;
    this.mrValue = this.selection.MatchRating;
    this.backOdds = this.selection.BackOdds;
    this.inRange = this.selection.inRange;

    //Hide or show expanded element based off criteria.

    if(this.userPref.isEvSelected ){
        // console.log(this.selection.Selection+ " Hidden: " + this.selection.ignore);
        if(changes.evValue) { //if ev has a value constantly loop over this.
          if( +this.evValue >= +this.userPref.evFilterValue && +this.backOdds >= +this.userPref.minOdds && +this.backOdds <= +this.userPref.maxOdds){ //evValue less than filter setting. hide. larger than. show.
            this.show();
          } else {
            this.hide();
          }
        } else { //if EV reading is larger than the filter  go in here.
            //for evValues less than the evFilter setting, hide the empty container.
          +this.evValue >= +this.userPref.evFilterValue && +this.backOdds >= +this.userPref.minOdds && +this.backOdds <= +this.userPref.maxOdds  ? this.show() : this.hide();
        }

        //If we don't have odds evValue Infinity value
        if(this.evValue > 1000 ){
          this.hide();
        }
      } else {

          if( +this.mrValue >= +this.userPref.maxRatingFilter && this.mrValue <= 100 && +this.backOdds >= +this.userPref.minOdds && +this.backOdds <= +this.userPref.maxOdds){
            this.show();
          }
          if(+this.mrValue >= +this.userPref.maxRatingFilter && this.mrValue <= 100 && +this.backOdds <= +this.userPref.minOdds){
            this.hide();
          }
          if(+this.mrValue >= +this.userPref.maxRatingFilter && this.mrValue <= 100 && +this.backOdds >= +this.userPref.maxOdds){
            this.hide();
          }
          if (+this.mrValue <= +this.userPref.maxRatingFilter){
            this.hide();
          }
      }

    // Incomplete Data calcs/ bad values
    if(this.evValue >= 100){
      this.hide();
    }
    // Incomplete Data calcs/ bad values
    if(this.mrValue >=1000){
      this.hide();
    }
   //Ignore status read.
    if(this.selection.ignore) {
      this.hide();
    }

    if(this.inRange == false){
      this.hide();
    }
  }

  hide(){
    this.renderer.addClass(this.elRef.nativeElement, 'hideTR')
  }

  show() {
    this.renderer.removeClass(this.elRef.nativeElement, 'hideTR');
  }
}

