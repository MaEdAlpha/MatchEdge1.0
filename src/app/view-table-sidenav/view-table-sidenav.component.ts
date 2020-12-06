import { Component, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { FormControl, FormGroup, NgForm } from '@angular/forms';
import { SidenavService } from './sidenav.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core/option';
import { UserPropertiesService } from '../user-properties.service';

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
  userMinOdds:string;
  userMaxOdds:string;
  userEVfilter:string;

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

  ngOnInit(): void {
    //TODO retrieve formData from userPreferences
    //TODO call on UserPreferences Service to load form OnInit
    var prefObject = this.userPref.getFormValues();
    this.leagues = prefObject.leagueSelection;
    this.selectedTime = prefObject.timeRange;
    this.userMinOdds = prefObject.minOdds;
    this.userMaxOdds = prefObject.maxOdds;
    this.userEVfilter = prefObject.evFilterValue;

    this.viewTableForm = new FormGroup({
      'leagueSelection': new FormControl(this.leagues),
      'timeRange': new FormControl(this.selectedTime),
      'minOdds': new FormControl(this.userMinOdds),
      'maxOdds': new FormControl(this.userMaxOdds),
      'evFilterValue': new FormControl(this.userEVfilter),
    });
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
}
