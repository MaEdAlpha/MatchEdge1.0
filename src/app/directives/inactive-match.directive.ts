import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appInactiveMatch]'
})
export class InactiveMatchDirective implements OnInit{
@Input() match:any;
@Input() matchIndex: number;
  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

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
