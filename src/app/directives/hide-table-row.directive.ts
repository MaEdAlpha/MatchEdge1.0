import { Directive, Input, OnChanges, SimpleChanges, Renderer2, ElementRef } from '@angular/core';
import { TablePreferences } from '../user-properties.model';

@Directive({
  selector: '[appHideTableRow]'
})
export class HideTableRowDirective implements OnChanges{
  @Input() evValue: number;    //updated from mongoStreamWatch
  @Input() mrValue: number;    //match-rating value
  @Input() ssValue: number;    //secret Sauce
  @Input() backOdds: number;   //backOdds
  //inRange: boolean;   //is in Date Range
  @Input() isWatched: boolean;    //ignore Status
  @Input() userPref: TablePreferences;
  @Input() inRange;

  constructor(private renderer: Renderer2, private elRef: ElementRef) {  }

  ngOnChanges(changes: SimpleChanges){

  //filter out Groups
  if(this.inRange != undefined || this.isWatched != undefined || this.userPref != undefined){
    if(+this.userPref.isEvSelected == 1)  {
        // console.log(this.selection.Selection+ " Hidden: " + this.selection.ignore);
        if(changes.evValue) { //if ev has a value constantly loop over this.
          if(this.inRange == true && +this.evValue >= +this.userPref.evFilterValueI && +this.backOdds >= +this.userPref.minOdds && +this.backOdds <= +this.userPref.maxOdds){ //evValue less than filter setting. hide. larger than. show.
            this.show();
          } else {
            this.hide();
          }
        } else { //if EV reading is larger than the filter  go in here.
            //for evValues less than the evFilterValueI setting, hide the empty container.
          +this.evValue >= +this.userPref.evFilterValueI && +this.backOdds >= +this.userPref.minOdds && +this.backOdds <= +this.userPref.maxOdds  ? this.show() : this.hide();
        }

        //If we don't have odds evValue Infinity value
        if(this.evValue > 1000 ){
          this.hide();
        }

      } else if(+this.userPref.isEvSelected == 2 ) {

          if( this.inRange == true && +this.mrValue >= +this.userPref.matchRatingFilterI && this.mrValue <= 100 && +this.backOdds >= +this.userPref.minOdds && +this.backOdds <= +this.userPref.maxOdds){
            this.show();
          }
          if(+this.mrValue >= +this.userPref.matchRatingFilterI && this.mrValue <= 100 && +this.backOdds < +this.userPref.minOdds){
            this.hide();
          }
          if(+this.mrValue >= +this.userPref.matchRatingFilterI && this.mrValue <= 100 && +this.backOdds > +this.userPref.maxOdds){
            this.hide();
          }
          if (+this.mrValue <= +this.userPref.matchRatingFilterI){
            this.hide();
          }
      } else if(+this.userPref.isEvSelected == 3 ) {

        if( this.inRange == true && +this.ssValue >= +this.userPref.secretSauceI && this.ssValue <= 100 && +this.backOdds >= +this.userPref.minOdds && +this.backOdds <= +this.userPref.maxOdds){
          this.show();
        }
        if(+this.ssValue >= +this.userPref.secretSauceI && this.ssValue <= 100 && +this.backOdds < +this.userPref.minOdds){
          this.hide();
        }
        if(+this.ssValue >= +this.userPref.secretSauceI && this.ssValue <= 100 && +this.backOdds > +this.userPref.maxOdds){
          this.hide();
        }
        if (+this.ssValue <= +this.userPref.secretSauceI){
          this.hide();
        }
      }

      //To handle production Error "changesAfterViewInit detected:
      // Incomplete Data calcs/ bad values
      if(this.evValue >= 100){
        this.hide();
      }
      // Incomplete Data calcs/ bad values
      if(this.mrValue >=1000){
        this.hide();
      }
      if(this.inRange == false){
        this.hide();
      }
     //Ignore status read.
      if(!this.isWatched) {
        this.hide();
      }

      if(!this.inRange){
        this.hide();
      }
    }

  }


  hide(){
    this.renderer.addClass(this.elRef.nativeElement, 'hideTR')
  }

  show() {
    this.renderer.removeClass(this.elRef.nativeElement, 'hideTR');
  }
}

