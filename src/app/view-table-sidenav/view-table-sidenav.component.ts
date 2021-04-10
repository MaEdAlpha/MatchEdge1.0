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
  evFilter: number;
  minOddsFilter: number;
  maxOddsFilter: number;
  matchRatingFilter: number;
  isEvSelected: boolean;
  evPlaceholder: string;
  dialogDisabled: boolean;

  leaguesControl: FormControl;

       leagues: string[] = [
         'England Championship',
         'England League 1',
         'England League 2',
         'England Premier League',
         'France Ligue 1',
         'Germany Bundesliga I',
         'Italy Serie A',
         'Scotland Premiership',
         'Spain Primera Liga',
         'UEFA Champions League',
         'UEFA Europa League',
      ];

      leagueGroups: LeagueGroup[] = [
        {
          country: 'United Kingdom',
          leagues: [
            'England Championship',
            'England League 1',
            'England League 2',
            'England Premier League'
          ]
        },
        {
          country: 'UEFA',
          leagues: [
            'UEFA Champions League',
            'UEFA Europa League',
          ]
        },
        {
          country: 'Spain',
          leagues: [
            'Spain Primera Liga'
          ]
        },
        {
          country: 'Germany',
          leagues: [
            "Germany Bundesliga I"
          ]
        },
        {
          country: 'Italy',
          leagues: [
            'Italy Serie A'
          ]
        },
        {
          country: 'France',
          leagues: [
            'France Ligue 1'
          ]
        }
      ];

      ranges: TimeRange[] = [
        { timeKey: '0', timeValue: 'Today & Tomorrow' },
        { timeKey: '1', timeValue: 'Today' },
        { timeKey: '2', timeValue: 'Tomorrow' }
      ];

      filters: any[] = [
        { option: 'EV', value: true },
        { option: 'Match Rating', value: false }
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
      'evFilterValue': new FormControl(this.prefObj.evFilterValue),
      'maxRatingFilter': new FormControl(this.prefObj.maxRatingFilter),
      'isEvSelected': new FormControl(this.prefObj.isEvSelected),
      'dialogDisabled': new FormControl(this.prefObj.dialogDisabled),
    });

    //Subscribe to update. Retrieves UserPreferences from Service. Subscribes to it.
    this.userPrefSubscription = this.userPrefService.getUserPrefs().subscribe( tablePref => {
      this.prefObj = tablePref;
      this.timeRange = tablePref.timeRange;
      this.evFilter = Number(tablePref.evFilterValue);
      this.minOddsFilter= Number(tablePref.minOdds);
      this.maxOddsFilter= Number(tablePref.maxOdds);
      this.matchRatingFilter= Number(tablePref.maxRatingFilter);
      this.isEvSelected = tablePref.isEvSelected;
      this.evPlaceholder = this.filters[0].value == this.isEvSelected ? "EV" : "Match Rating";
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

  getLeagueSelection(){
    //TODO input service to call on userLeague Selection default.
    return this.leagues;
  }

  showMe(){
    this.dialogDisabled = !this.dialogDisabled;
    console.log(this.dialogDisabled);
  }
}
