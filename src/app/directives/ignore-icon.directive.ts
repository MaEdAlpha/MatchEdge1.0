import { Directive, Input, OnChanges, SimpleChanges, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[appIgnoreIcon]'
})
export class IgnoreIconDirective implements OnChanges{
  @Input() ignoreStatus: boolean;
  constructor(private renderer: Renderer2, private elRef: ElementRef) { }

  ngOnChanges(changes:SimpleChanges)
  {
    if(changes.ignoreStatus.currentValue)
    {
      this.ignore();
    } else
    {
     this.doNotIgnore();
    }
  }

  ignore(){
    this.renderer.addClass(this.elRef.nativeElement, 'ignoreThis');
  }

  doNotIgnore(){
    this.renderer.removeClass(this.elRef.nativeElement, 'ignoreThis');
  }
}
