import { Injectable } from '@angular/core';
import { GroupRepositroy } from '../model/group.repository';
import { Group } from '../model/group.model';

@Injectable({ providedIn: 'root' })
export class GroupDataService {
  private groupsData: Group[] = [];
  private groupId?: string = '';

  constructor(private groupRepo: GroupRepositroy) {
    groupRepo.getGroups().subscribe((group) => {
      this.groupsData = group;
    });
  }

  setGroupId(groupId?: string) {
    this.groupId = groupId;
  }

  getGroupId() {
    return this.groupId;
  }
}
