import { RestDataSource } from './../model/restDatasource';
import { GroupDetailComponent } from './groupDetail/groupDetails.component';
import { NgModule } from '@angular/core';
import { ShowGroupsComponent } from './showGroups.component';
import { GroupRepositroy } from '../model/group.repository';
import { ModelModule } from '../model/model.module';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateGroupComponent } from './createGroups.component';

@NgModule({
  imports: [
    ModelModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [ShowGroupsComponent, CreateGroupComponent],
  exports: [ShowGroupsComponent],
})
export class ViewModule {}
