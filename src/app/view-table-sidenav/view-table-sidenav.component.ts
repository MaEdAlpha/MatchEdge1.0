import { Component, OnInit, ViewChild, AfterViewInit, OnChanges, SimpleChanges  } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { SidenavService } from './sidenav.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core/option';
import { UserPropertiesService } from '../user-properties.service';
import { UserProperties, ViewTablePreferences } from '../user-properties.model';

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

export class ViewTableSidenavComponent implements OnChanges, OnInit, AfterViewInit {
  @ViewChild('select') select: MatSelect;
  @ViewChild('sidenav') public sidenav: MatSidenav;
  //sidnav modetype
  mode: string = "side";

  //properties of league selection drop down
  allSelected: boolean = true;
  selectedTime: string;
  viewTableForm: FormGroup;

  viewTablePref: ViewTablePreferences;

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

  constructor(private sidenavService: SidenavService, private userPref: UserPropertiesService) {

  }

  ngOnChanges(changes: SimpleChanges){
    if(changes.viewTablePref) {
      this.viewTablePref = this.userPref.getFormValues();
      //console.log(this.viewTablePref);

    }
  }

  ngOnInit(): void {
    //TODO retrieve formData from userPreferences
    //TODO call on UserPreferences Service to load form OnInit
    // let prefObject: ViewTablePreferences = this.userPref.getFormValues();
    // this.viewTablePref.leagueSelection = prefObject.leagueSelection;
    // this.viewTablePref.timeRange = prefObject.timeRange;
    // this.viewTablePref.minOdds = prefObject.minOdds;
    // this.viewTablePref.maxOdds = prefObject.maxOdds;
    // this.viewTablePref.evFilterValue = prefObject.evFilterValue;
    this.viewTablePref = this.userPref.getFormValues();
    this.viewTableForm = new FormGroup({
      'leagueSelection': new FormControl(this.viewTablePref.leagueSelection),
      'timeRange': new FormControl(this.viewTablePref.timeRange),
      'minOdds': new FormControl(this.viewTablePref.minOdds),
      'maxOdds': new FormControl(this.viewTablePref.maxOdds),
      'evFilterValue': new FormControl(this.viewTablePref.evFilterValue),
    });

    this.userPref.viewTablePrefSelected
    .subscribe( (userPreferences) => {
      this.viewTablePref = userPreferences
    }

    );
  }

  ngAfterViewInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }

  onSubmit(){
    //send this data to user preferences and other webservices for handling.

    //emit this so services can hear and set to matchStats/juicymatch component.

    //set in program to validate for juicy matches.
    this.userPref.setFormValues(this.viewTableForm.value);
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

  setUserPreference(){

  }
}