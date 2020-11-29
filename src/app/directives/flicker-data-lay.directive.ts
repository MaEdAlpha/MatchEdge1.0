import { Directive, Input, ElementRef, Renderer2, SimpleChanges, OnChanges } from '@angular/core';

@Directive({
  selector: '[appFlickerDataLay]'
})
export class FlickerDataLayDirective implements OnChanges {
  @Input() flickerColmnIndex:number;
  @Input() isUpdated: any;

  constructor(private elRef: ElementRef, private renderer: Renderer2){ }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.isUpdated && changes.isUpdated.currentValue)
    {
      this.flickerUpdate();
    }
  }

  flickerUpdate() {
    if(this.isUpdated)
    {
      var className = 'ticker'+this.flickerColmnIndex+'box';
      this.renderer.removeClass(this.elRef.nativeElement, className);
      this.renderer.addClass(this.elRef.nativeElement, 'flickDirectiveLay');

      setTimeout(() => {
                          this.renderer.removeClass(this.elRef.nativeElement, 'flickDirectiveLay');
                          this.renderer.addClass(this.elRef.nativeElement, className);
      }, 5400);
    }

  }
}
