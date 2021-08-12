import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appInactiveMatch]'
})
export class InactiveMatchDirective implements OnInit, OnChanges{
@Input() match:any;

  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(simpleChanges:SimpleChanges){
    if(simpleChanges.match.currentValue == true){
      this.setsInactiveStyling();
    }
  }

  ngOnInit(){
    this.match.isPastPrime ? this.setsInactiveStyling() : this.methodIsEmptry();
  };

  setsInactiveStyling(){
    const className = "match-inactive";

    this.renderer.addClass(this.elRef.nativeElement, className);
  }

  methodIsEmptry(){
    //do something here?
  }

}
