import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-popup-two-up-product',
  templateUrl: './popup-two-up-product.component.html',
  styleUrls: ['./popup-two-up-product.component.css']
})
export class PopupTwoUpProductComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  scrollToView(idTag:string) {
    let el = document.querySelector(idTag);

    el.scrollIntoView({ block:"start", inline:"center", behavior: "smooth"});
  }

}
