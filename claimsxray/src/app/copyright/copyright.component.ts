import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.component.html',
  styleUrls: ['./copyright.component.css']
})
export class CopyrightComponent implements OnInit {
  version: string = environment.version;

  constructor() { }

  ngOnInit(): void {
  }

}
