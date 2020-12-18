import { Directive, Input, OnChanges, SimpleChanges, Renderer2, ElementRef } from '@angular/core';
import { TablePreferences } from '../user-properties.model';

@Directive({
  selector: '[appHideTableRow]'
})
export class HideTableRowDirective implements OnChanges{
  @Input() evValue: any;    //updated from mongoStreamWatch
  @Input() mrValue: any;    //match-rating value
  @Input() backOdds: number; //backOdds
  @Input() userPref: TablePreferences;

  userEVfilterValue: any;

  constructor(private renderer: Renderer2, private elRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges){
    if(this.userPref.isEvSelected){
      if(changes.evValue) { //if ev has a value constantly loop over this.
        if(this.evValue <= this.userPref.evFilterValue){ //evValue less than filter setting. hide. larger than. show.
            this.hide()
        } else {
          this.show();
        }
      } else { //if EV reading is larger than the filter  go in here.
          //for evValues less than the evFilter setting, hide the empty container.
        this.evValue <= this.userPref.evFilterValue ? this.hide() : this.show();
      }
      //If we don't have odds and shit reads Infinity value
      if(this.evValue > 1000 ){
        this.hide();
      }
    } else {
      if(changes.mrValue){
        if(this.mrValue <= this.userPref.maxRatingFilter){
          this.hide();
        } else {
          this.show();
        }
      } else {
        this.mrValue <= this.userPref.maxRatingFilter ? this.hide() : this.show();
      }
    }

    if(this.evValue >= 100){
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

