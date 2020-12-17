import { Directive, Input, Renderer2, ElementRef, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';

@Directive({
  selector: '[appFlickerDataMatchRating]'
})
export class FlickerDataMatchRatingDirective {
  @Input() isUpdated:boolean;
  @Input() columnIndex:number;

  constructor( private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges){
    if(changes.isUpdated && changes.isUpdated.currentValue){
      this.flickerUpdate();
    }
  }
  flickerUpdate(){
    var className ="mr"+ this.columnIndex + "box";
    this.renderer.removeClass(this.elRef.nativeElement, className);
    this.renderer.addClass(this.elRef.nativeElement, 'flickDirectiveMR');

    setTimeout( ()=>{
                      this.renderer.removeClass(this.elRef.nativeElement, 'flickDirectiveMR');
                      this.renderer.addClass(this.elRef.nativeElement, className);
    }, 5400);
  }
}
