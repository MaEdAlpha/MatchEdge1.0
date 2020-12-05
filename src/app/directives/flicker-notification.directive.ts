import { Directive, OnChanges, Input, ElementRef, Renderer2, SimpleChanges } from '@angular/core'
import { JuicyMatchComponent } from '../juicy-match/juicy-match.component';

@Directive({
  selector: '[appFlickerData]'
})

export  class FlickerDataDirective implements  OnChanges {
  @Input() flickerColmnIndex:number;
  @Input() isUpdated: any;

  constructor(private elRef: ElementRef, private renderer: Renderer2, private juicyComp: JuicyMatchComponent){ }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.isUpdated && changes.isUpdated.currentValue)
    {
      this.flickerUpdate();
    }
  }

  flickerUpdate() {
    if(this.isUpdated)
    {
      var className = 'ticker'+ this.flickerColmnIndex +'box';
      this.renderer.removeClass(this.elRef.nativeElement, className);
      this.renderer.addClass(this.elRef.nativeElement, 'backDirective');

      setTimeout(() => {
                          this.renderer.removeClass(this.elRef.nativeElement, 'backDirective');
                          this.renderer.addClass(this.elRef.nativeElement, className);
      }, 5400);
    }

  }
}



