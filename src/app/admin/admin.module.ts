import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/authService';
import { AdminGroupsComponent } from './admin-groups/admin-groups.component';
import { GroupRepositroy } from '../model/group.repository';
import { RestDataSource } from '../model/restDatasource';
import { AuthGuard } from './auth.guard';

let routing = RouterModule.forChild([
  {
    path: 'auth',
    component: AuthComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'show-all-groups',
    component: AdminGroupsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
]);

@NgModule({
  declarations: [AuthComponent, AdminGroupsComponent],
  exports: [AuthComponent],
  providers: [AuthService, GroupRepositroy, RestDataSource, AuthGuard],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, routing],
})
export class AdminModule {}
