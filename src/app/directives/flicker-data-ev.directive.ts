import { Directive, Input, Renderer2, ElementRef, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';

@Directive({
  selector: '[appFlickerDataEv]'
})
export class FlickerDataEvDirective implements OnChanges{
  @Input() isUpdated:boolean;
  @Input() columnIndex:number;

  constructor( private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.isUpdated && changes.isUpdated.currentValue){
      this.flickerUpdate();
    }
  }

  flickerUpdate(){
    var className ="ev"+ this.columnIndex + "box";
    this.renderer.removeClass(this.elRef.nativeElement, className);
    this.renderer.addClass(this.elRef.nativeElement, 'flickDirectiveEV');

    setTimeout( ()=>{
                      this.renderer.removeClass(this.elRef.nativeElement, 'flickDirectiveEV');
                      this.renderer.addClass(this.elRef.nativeElement, className);
    }, 5400);
  }
}
