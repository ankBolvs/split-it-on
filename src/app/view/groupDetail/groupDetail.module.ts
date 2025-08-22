import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AddExpenseComponent } from './addExpense.component';
import { AddUserComponent } from './addUser.component';
import { GroupDetailComponent } from './groupDetails.component';
import { ParentGroupDetailComponent } from './parenGroupDetail.component';

let routing = RouterModule.forChild([
  //nested routes

  {
    path: 'parent-group-details',
    component: ParentGroupDetailComponent,

    children: [
      {
        path: 'group-details',
        component: GroupDetailComponent,
      },
      {
        path: 'addExpense',
        component: AddExpenseComponent,
      },
      { path: 'addUsers', component: AddUserComponent }, //edit  //x,y are route params   //paramaters live inside the scope of route

      { path: '**', redirectTo: 'group-details' },
    ],
  },
  {
    path: '**',
    redirectTo: 'parent-group-details', //hashbang-default hashbang
  },
]);

@NgModule({
  imports: [CommonModule, routing, FormsModule, ReactiveFormsModule],
  exports: [],
  declarations: [
    ParentGroupDetailComponent,
    GroupDetailComponent,
    AddUserComponent,
    AddExpenseComponent,
  ],
  providers: [],
})
export class GroupDetailModule {}
