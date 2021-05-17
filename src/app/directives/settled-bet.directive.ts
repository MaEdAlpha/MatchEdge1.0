import { Directive, ElementRef, Input, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSettledBet]'
})
export class SettledBetDirective {
@Input() isSettled:boolean;
  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.isSettled){
      this.isSettled ? this.renderer.addClass(this.elRef.nativeElement, 'settled-row') : this.renderer.removeClass(this.elRef.nativeElement, 'settled-row')
    }
  }
}
