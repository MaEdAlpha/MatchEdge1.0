import { Directive, Input, OnChanges, SimpleChanges, Renderer2, ElementRef } from '@angular/core';
import { TablePreferences } from '../user-properties.model';

@Directive({
  selector: '[appHideTableRow]'
})
export class HideTableRowDirective implements OnChanges{
  @Input() evValue: number;    //updated from mongoStreamWatch
  @Input() mrValue: number;    //match-rating value
  @Input() backOdds: number; //backOdds
  @Input() userPref: TablePreferences;

  constructor(private renderer: Renderer2, private elRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges){

      if(this.userPref.isEvSelected ){
        if(changes.evValue) { //if ev has a value constantly loop over this.
          if(Number(this.evValue) >= Number(this.userPref.evFilterValue) && Number(this.backOdds) >= Number(this.userPref.minOdds) && Number(this.backOdds) <= Number(this.userPref.maxOdds)){ //evValue less than filter setting. hide. larger than. show.
            this.show();
          } else {
            this.hide();
          }
        } else { //if EV reading is larger than the filter  go in here.
            //for evValues less than the evFilter setting, hide the empty container.
          Number(this.evValue) >= Number(this.userPref.evFilterValue) && Number(this.backOdds) >= Number(this.userPref.minOdds) && Number(this.backOdds) <= Number(this.userPref.maxOdds)  ? this.show() : this.hide();
        }
        //If we don't have odds and shit reads Infinity value
        if(this.evValue > 1000 ){
          this.hide();
        }
      } else {

          if(Number(this.mrValue) >= Number(this.userPref.maxRatingFilter) && this.mrValue <= 100 && Number(this.backOdds) >= Number(this.userPref.minOdds) && Number(this.backOdds) <= Number(this.userPref.maxOdds)){
            this.show();
          }
          if(Number(this.mrValue) >= Number(this.userPref.maxRatingFilter) && this.mrValue <= 100 && Number(this.backOdds) <= Number(this.userPref.minOdds)){
            this.hide();
          }
          if(Number(this.mrValue) >= Number(this.userPref.maxRatingFilter) && this.mrValue <= 100 && Number(this.backOdds) >= Number(this.userPref.maxOdds)){
            this.hide();
          }
          if (Number(this.mrValue) <= Number(this.userPref.maxRatingFilter)){
            this.hide();
          }
      }

    if(this.evValue >= 100){
      this.hide();
    }

    if(this.mrValue >=1000){
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

