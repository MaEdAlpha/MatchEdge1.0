import { Directive, ElementRef, Renderer2, Input, SimpleChanges, OnChanges } from '@angular/core';

@Directive({
  selector: '[appWatchHome]'
})
export class WatchHomeDirective implements OnChanges{


  @Input() watchStatus:boolean;
  @Input() homeTeam:any = null;
    constructor(private elRef: ElementRef, private renderer: Renderer2) { }


    ngOnChanges(changes: SimpleChanges){
      if(changes.watchStatus.currentValue)
      {
        this.highlightElementReference(this.homeTeam);
      } else {
        this.defaultElementReference(this.homeTeam);
      }
    }

    //when adding in more bookies, you will need to introduce a new property for bookies
    highlightElementReference(team:string){
          this.renderer.addClass(this.elRef.nativeElement, 'hmStatus');
          //Call a service to set to notificationsList. Will need to pass in matchObject
          if(team!=null)
          {
            console.log(team);
          } else {
            //do nothing
          }
     }

    defaultElementReference(team:string){
      this.renderer.removeClass(this.elRef.nativeElement, 'hmStatus');
      if(team!=null)
      {
        console.log(team);
      }
      //Call a service to delete this from the notificationsList.
    }
}
