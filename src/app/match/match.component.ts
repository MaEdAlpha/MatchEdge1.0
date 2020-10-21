import { Component, OnInit } from '@angular/core';
import {Match} from './match.model';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  matches: Match[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
