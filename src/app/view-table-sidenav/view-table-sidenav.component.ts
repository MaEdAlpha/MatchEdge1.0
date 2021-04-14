import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { SidenavService } from './sidenav.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core/option';
import { UserPropertiesService } from '../services/user-properties.service';
import { UserProperties, TablePreferences } from '../user-properties.model';
import { Subscription } from 'rxjs';


interface LeagueGroup {
  country: string;
  leagues: string[];
}

interface TimeRange {
  timeKey: string;
  timeValue: string;
}

@Component({
  selector: 'app-view-table-sidenav',
  templateUrl: './view-table-sidenav.component.html',
  styleUrls: ['./view-table-sidenav.component.css'],
})

export class ViewTableSidenavComponent implements OnInit, AfterViewInit {
  @ViewChild('select') select: MatSelect;
  @ViewChild('sidenav') public sidenav: MatSidenav;
  //sidnav modetype
  mode: string = "side";

  //properties of league selection drop down
  allSelected: boolean = true;
  selectedTime: string;
  viewTableForm: FormGroup;
  userPrefSubscription: Subscription;


  prefObj: TablePreferences;
  timeRange: string;
  evFilterI: number;
  evFilterII: number;
  minOddsFilter: number;
  maxOddsFilter: number;
  matchRatingFilterI: number;
  matchRatingFilterII:number;
  secretSauceI:number;
  secretSauceII:number;
  isEvSelected: string;
  evPlaceholder: string;
  dialogDisabled: boolean;

      filters: any[] = [
        { option: 'EV', value: '1' },
        { option: 'Match Rating', value: '2' },
        { option: 'Secret Sauce', value: '3'}
      ]

  constructor(private sidenavService: SidenavService, private userPrefService: UserPropertiesService) {}

  ngOnInit(): void {

    this.prefObj = this.userPrefService.getFormValues();
    this.dialogDisabled= this.prefObj.dialogDisabled;

    this.viewTableForm = new FormGroup({
      'leagueSelection': new FormControl(this.prefObj.leagueSelection),
      'timeRange': new FormControl(this.prefObj.timeRange),
      'minOdds': new FormControl(this.prefObj.minOdds),
      'maxOdds': new FormControl(this.prefObj.maxOdds),
      'evFilterValueI': new FormControl(this.prefObj.evFilterValueI),
      'evFilterValueII': new FormControl(this.prefObj.evFilterValueII),
      'matchRatingFilterI': new FormControl(this.prefObj.matchRatingFilterI),
      'matchRatingFilterII': new FormControl(this.prefObj.matchRatingFilterII),
      'secretSauceI': new FormControl(this.prefObj.secretSauceI),
      'secretSauceII': new FormControl(this.prefObj.secretSauceII),
      'isEvSelected': new FormControl(this.prefObj.isEvSelected),
      'dialogDisabled': new FormControl(this.prefObj.dialogDisabled),
    });

    //Subscribe to update. Retrieves UserPreferences from Service. Subscribes to it.
    this.userPrefSubscription = this.userPrefService.getUserPrefs().subscribe( tablePref => {
      this.prefObj = tablePref;
      this.timeRange = tablePref.timeRange;
      this.evFilterI = Number(tablePref.evFilterValueI);
      this.evFilterII= Number(tablePref.evFilterValueII);
      this.minOddsFilter= Number(tablePref.minOdds);
      this.maxOddsFilter= Number(tablePref.maxOdds);
      this.matchRatingFilterI= Number(tablePref.matchRatingFilterI);
      this.matchRatingFilterII=Number(tablePref.matchRatingFilterII);
      this.secretSauceI= Number(tablePref.secretSauceI);
      this.secretSauceII=Number(tablePref.secretSauceII);
      this.isEvSelected = tablePref.isEvSelected;
      this.evPlaceholder = this.filters[0].value == 1 ? "EV" : this.filters[1].value == 2 ? "Match Rating" : this.filters[2].value == 3 ? "Secret Sauce" : "null" ;
      this.dialogDisabled = tablePref.dialogDisabled;
    });
  }

  ngAfterViewInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }

  onSubmit(){
   /* send this data to user preferences and other webservices for handling.
    emit this so services can hear and set to matchStats/juicymatch component.
    set in program to validate for juicy matches. */
    this.userPrefService.setFormValues(this.viewTableForm.value);

    this.sidenavService.toggle();
  }

  toggleAllSelection(){
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }

  optionClick() {
    let newStatus = true;
    this.select.options.forEach((item: MatOption) => {
      if (!item.selected) {
        newStatus = false;
      }
    });
    this.allSelected = newStatus;
  }


  showMe(){
    this.dialogDisabled = !this.dialogDisabled;
    console.log(this.dialogDisabled);
  }
}
