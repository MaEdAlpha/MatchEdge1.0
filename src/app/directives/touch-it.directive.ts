import { Directive, Input, Renderer2, ElementRef, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appTouchIt]'
})
export class TouchItDirective {
  @Input() isTouched:boolean;
  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.isTouched){
      this.isTouched ? this.renderer.addClass(this.elRef.nativeElement, 'touchRow') : this.renderer.removeClass(this.elRef.nativeElement, 'touchRow');
    }
  }
}
