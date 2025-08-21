import { RestDataSource } from './../model/restDatasource';
import { GroupDetailComponent } from './groupDetails.component';
import { NgModule } from '@angular/core';
import { ShowGroupsComponent } from './showGroups.component';
import { GroupRepositroy } from '../model/group.repository';
import { ModelModule } from '../model/model.module';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateGroupComponent } from './createGroups.component';
import { AddUserComponent } from './addUser.component';
import { AddExpenseComponent } from './addExpense.component';

@NgModule({
  imports: [
    ModelModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  declarations: [
    ShowGroupsComponent,
    GroupDetailComponent,
    CreateGroupComponent,
    AddUserComponent,
    AddExpenseComponent
  ],
  exports: [ShowGroupsComponent, GroupDetailComponent,AddUserComponent],
})
export class ViewModule {}
