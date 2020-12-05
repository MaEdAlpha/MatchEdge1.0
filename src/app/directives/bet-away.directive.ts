import { Directive, Input, SimpleChanges, OnChanges, Renderer2, ElementRef  } from '@angular/core';

@Directive({
  selector: '[appBetAway]'
})
export class BetAwayDirective implements OnChanges {

  @Input() aBetStatus:boolean;
  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.aBetStatus.currentValue)
    {
      this.setBetActive();
    } else {
      this.setBetInActive();
    }
  }

  setBetActive(){
    this.renderer.addClass(this.elRef.nativeElement, 'dirABetStatus');
  }

  setBetInActive(){
    this.renderer.removeClass(this.elRef.nativeElement, 'dirABetStatus');
  }
}
