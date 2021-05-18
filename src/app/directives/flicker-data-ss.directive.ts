import { Directive, Input, Renderer2, ElementRef, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';

@Directive({
  selector: '[appFlickerDataSS]'
})
export class FlickerDataSSDirective {
  @Input() isUpdated:boolean;
  @Input() columnIndex:number;

  constructor( private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.isUpdated && changes.isUpdated.currentValue){
      this.flickerUpdate();
    }
  }
  flickerUpdate(){
    var className ="ss"+ this.columnIndex + "box";
    this.renderer.removeClass(this.elRef.nativeElement, className);
    this.renderer.addClass(this.elRef.nativeElement, 'flickDirectiveSS');

    setTimeout( ()=>{
                      this.renderer.removeClass(this.elRef.nativeElement, 'flickDirectiveSS');
                      this.renderer.addClass(this.elRef.nativeElement, className);
    }, 5400);
  }
}
