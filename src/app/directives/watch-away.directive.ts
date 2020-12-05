import { Directive, Input, ElementRef, Renderer2, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appWatchAway]'
})
export class WatchAwayDirective implements OnChanges {

  @Input() awayWatchStatus: boolean;
  @Input() awayTeam: string;

  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnChanges(changes: SimpleChanges)
  {
    if(changes.awayWatchStatus.currentValue)
    {
      this.highlightElementReference(this.awayTeam);
    } else {
      this.defaultElementReference(this.awayTeam);
    }
  }


  highlightElementReference( team:string) {
    this.renderer.addClass(this.elRef.nativeElement, 'awStatus');
    if(team!=null)
    {
      //Call a service to add the team name (any other data?) to notifications list.
    } else {
      //do nothing
    }
  }

  defaultElementReference( team: string) {
    this.renderer.removeClass(this.elRef.nativeElement, 'awStatus')
  }

}
