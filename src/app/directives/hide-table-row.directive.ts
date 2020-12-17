import { Directive, Input, OnChanges, SimpleChanges, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[appHideTableRow]'
})
export class HideTableRowDirective implements OnChanges{
  @Input() evValue: any;    //updated from mongoStreamWatch
  @Input() evFilter: number; //observable pulled form juicy-match component. Will refresh when changed.
  @Input() backOdds: number; //backOdds
  @Input() backMinOddsFilter: number;
  @Input() backMaxOddsFilter: number;
  @Input() isEvSelected: boolean;

  userEVfilterValue: any;

  constructor(private renderer: Renderer2, private elRef: ElementRef) {
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.evValue) { //if ev has a value constantly loop over this.
      if(this.evValue < this.evFilter) //evValue less than filter setting. hide. larger than. show.
        {
          this.hide()
        } else {
          this.show();
        }
      } else { //if EV reading is larger than the filter  go in here.
        //for evValues less than the evFilter setting, hide the empty container.
        this.evValue < this.evFilter ? this.hide() : this.show();

    }
    //If we don't have odds and shit reads Infinity value
    if(this.evValue > 1000 ){
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

