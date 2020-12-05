import { Directive, Input, SimpleChanges, OnChanges, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[appBetHome]'
})
export class BetHomeDirective implements OnChanges {
  @Input() hBetStatus:boolean;
  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.hBetStatus.currentValue)
    {
      this.setBetActive();
    } else {
      this.setBetInActive();
    }
  }

  setBetActive(){
    this.renderer.addClass(this.elRef.nativeElement, 'dirHBetStatus');
  }

  setBetInActive(){
    this.renderer.removeClass(this.elRef.nativeElement, 'dirHBetStatus');
  }
}
