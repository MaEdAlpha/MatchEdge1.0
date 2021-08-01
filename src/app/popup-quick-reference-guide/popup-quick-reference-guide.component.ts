import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-quick-reference-guide',
  templateUrl: './popup-quick-reference-guide.component.html',
  styleUrls: ['./popup-quick-reference-guide.component.css']
})
export class PopupQuickReferenceGuideComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  cycleImageForward(clickedRight:boolean){

    if(clickedRight){
      //cycle +1 in image index
    }else{
      //cycle to -1 indexed image
    }
  }
}
