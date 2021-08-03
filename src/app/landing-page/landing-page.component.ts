import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductFeaturesComponent } from '../product-features/product-features.component';
import { TwoUpProductFeaturesComponent } from '../two-up-product-features/two-up-product-features.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {

  constructor( private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  displayTwoUpInfo(){
     this.dialog.open(TwoUpProductFeaturesComponent, {panelClass: 'two-up-landing-page'});
  }

}
