import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupRepositroy } from '../../model/group.repository';
import { Group } from '../../model/group.model';
import { User } from '../../model/user.model';
import { Expense } from '../../model/expense.model';
import { UserService } from '../../services/user.service';
import { GroupDataService } from '../../services/groupdata.service';

@Component({
  selector: 'group-details',
  templateUrl: 'groupDetails.component.html',
  styleUrl: 'groupDetails.component.css',
})
export class GroupDetailComponent implements OnInit {
  enableGroupDetail = true;
  group?: Group;
  groupId?: string;
  groupMembers: User[] = [];
  balances: { [userId: string]: number } = {};
  currentUserId: string = '';
  groupMembersData?: User[];
  groupCreatorId?: string = '';
  enableDelete: boolean = false;
  constructor(
    private groupRepo: GroupRepositroy,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private groupService: GroupDataService
  ) {
    // this.groupId = activeRoute.snapshot.params['id'];
    this.groupId = this.groupService.getGroupId();
    this.currentUserId = this.userService.getUserId(); // ✅ logged-in user
  }

  ngOnInit(): void {
    this.group = this.groupRepo.getGroup(this.groupId);

    if (this.group?.members) {
      this.groupMembers = this.groupRepo.getGroupUsersData(this.groupId);

      // Initialize balances
      this.groupMembers.forEach((m) => (this.balances[m.user_id!] = 0));

      // Fetch expenses for this group
      this.groupRepo
        .getExpenses$(this.groupId)
        .subscribe((expenses: Expense[]) => {
          this.calculateBalances(expenses);
        });
    }
  }

  private calculateBalances(expenses: Expense[]) {
    // Reset (important if this method can run more than once)
    Object.keys(this.balances).forEach((id) => (this.balances[id] = 0));

    expenses.forEach((exp) => {
      const amount = Number(exp.amount) || 0;
      const participants = exp.users ?? [];
      if (amount <= 0 || participants.length === 0) return;

      const share = amount / participants.length;

      // 1) Every participant owes their equal share
      participants.forEach((u) => {
        if (this.balances[u] === undefined) this.balances[u] = 0;
        this.balances[u] -= share;
      });

      // 2) The payer is credited the FULL amount they paid
      if (exp.paid_by) {
        if (this.balances[exp.paid_by] === undefined)
          this.balances[exp.paid_by] = 0;
        this.balances[exp.paid_by] += amount;
      }
    });

    // Round to 2 decimals
    Object.keys(this.balances).forEach(
      (id) => (this.balances[id] = Math.round(this.balances[id] * 100) / 100)
    );
  }

  // get groupDetail(): Group | undefined {
  //   return this.group;
  // }
  get groupDetail(): Group | undefined {
    this.group = this.groupRepo.getGroup(this.groupId);
    this.groupCreatorId = this.group?.created_by;
    // console.log('before if ' + this.currentUserId + ' ' + this.groupCreatorId);
    if (this.currentUserId == this.groupCreatorId) {
      //  console.log('inside if');
      this.enableDelete = true;
    }
    return this.group;
  }

  get getGroupUsersData() {
    this.groupMembersData = this.groupRepo.getGroupUsersData(this.groupId);
    return this.groupMembersData;
  }

  // ✅ Only members except current user
  get otherMembers(): User[] {
    return this.groupMembers.filter((m) => m.user_id !== this.currentUserId);
  }
}
