import { Component, OnInit } from '@angular/core';
import {Match} from './match.model';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  matches: Match[] = [new Match('test',  'test', 'test',  1,  2,  3,  4,  5,  'test',  1,  2,  3,  4,  5)];

  constructor() { }

  ngOnInit(): void {
  }

}
