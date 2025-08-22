import { Component, OnInit } from '@angular/core';
import { AppRoutingModule } from '../../app-routing.module';

@Component({
  selector: 'parent-group-detail',
  template: `<router-outlet></router-outlet>`,
})
export class ParentGroupDetailComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
