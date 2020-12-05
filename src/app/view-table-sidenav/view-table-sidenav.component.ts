import { Component, OnInit, ViewChild, AfterViewInit, ElementRef  } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { FormControl } from '@angular/forms';
import { SidenavService } from './sidenav.service';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core/option';

interface LeagueGroup {
  country: string;
  leagues: string[];
}

@Component({
  selector: 'app-view-table-sidenav',
  templateUrl: './view-table-sidenav.component.html',
  styleUrls: ['./view-table-sidenav.component.css']
})

export class ViewTableSidenavComponent implements OnInit, AfterViewInit {
  @ViewChild('select') select: MatSelect;
  @ViewChild('sidenav') public sidenav: MatSidenav;

  mode: string = "side";
  leaguesControl = new FormControl();

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

  allSelected: boolean = true;
  selectedTime: string;

  constructor(private sidenavService: SidenavService) {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }

  onSubmit(form: ElementRef){
    console.log(form);
  }

  toggleAllSelection(){
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }

    console.log(this.leaguesControl);

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
}
