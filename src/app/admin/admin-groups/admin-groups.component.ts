import { Component } from '@angular/core';
import { Group } from '../../model/group.model';
import { GroupRepositroy } from '../../model/group.repository';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-groups',
  templateUrl: './admin-groups.component.html',
  styleUrl: './admin-groups.component.css',
})
export class AdminGroupsComponent {
  userName?: string | null;
  id: string;
  userGroups: Group[] = [];

  constructor(
    private groupRepo: GroupRepositroy,
    private userDetails: UserService,
    private router: Router
  ) {
    console.log('calling admin groups component');
    if (localStorage.getItem('admin_token') == undefined) {
      this.router.navigateByUrl('/');
    }
    this.id = userDetails.getUserId();
    this.userName = localStorage.getItem('admin_name');
  }

  get groups(): Group[] {
    return this.groupRepo.getAdminGroups();
  }

  deleteGroupButton(event: Event, group: Group) {
    event.preventDefault();
    this.groupRepo.deleteByAdminGroup(group);
    console.log('Function is invoked !!');
  }

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('refresh_token');
  }
}
