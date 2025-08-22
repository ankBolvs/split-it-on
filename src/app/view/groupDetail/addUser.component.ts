import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { UserRepository } from '../../model/user.repository';
import { Group } from '../../model/group.model';
import { GroupRepositroy } from '../../model/group.repository';
import { User } from '../../model/user.model';
import { GroupDataService } from '../../services/groupdata.service';

@Component({
  selector: 'add-user',
  templateUrl: './addUser.component.html',
  styleUrls: ['./addUser.component.css'],
})
export class AddUserComponent implements OnInit, OnDestroy {
  // route
  groupId?: string;

  // data
  group?: Group;
  allUsers: User[] = [];
  candidates: User[] = []; // users not already in group

  // UI state
  searchEmail = '';
  selectedIds = new Set<string>();
  loading = false;
  errorMsg = '';
  sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupRepo: GroupRepositroy,
    private userRepo: UserRepository,
    private groupDetail: GroupDataService
  ) {}
  ngOnInit(): void {
    // group id can come either as path param (:id) or as query (?groupId=)
    this.groupId = this.groupDetail.getGroupId();

    this.sub = this.groupRepo
      .loadGroups()
      .pipe(
        map(() => this.groupRepo.getGroup(this.groupId)),
        switchMap((grp) => {
          if (!grp) {
            this.group = undefined;
            return of([] as User[]); // ✅ always return User[]
          }
          this.group = grp;
          return this.userRepo.getAllUsers$(); // ✅ also User[]
        }),
        tap((users: User[]) => {
          if (!this.group) return;
          this.allUsers = users;
          const members = new Set(this.group.members ?? []);
          // Only those not already in this group
          this.candidates = this.allUsers.filter(
            (u) => u.user_id && !members.has(u.user_id)
          );
        })
      )
      .subscribe({
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Failed to load data.';
        },
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // case-sensitive contains on email
  get filteredCandidates(): User[] {
    if (!this.searchEmail) return this.candidates;
    return this.candidates.filter((u) =>
      (u.email ?? '').includes(this.searchEmail)
    );
  }

  // checkbox change
  toggleSelect(userId: string | undefined) {
    if (!userId) return;
    if (this.selectedIds.has(userId)) this.selectedIds.delete(userId);
    else this.selectedIds.add(userId);
  }

  isSelected(userId?: string): boolean {
    return !!userId && this.selectedIds.has(userId);
  }

  // submit
  addSelected(): void {
    if (!this.group || this.selectedIds.size === 0) return;

    this.loading = true;
    this.errorMsg = '';

    const memberIdsToAdd = Array.from(this.selectedIds);

    // 1) Update group.members via PUT
    this.groupRepo
      .addMembersToGroup(memberIdsToAdd, this.groupId)
      .pipe(
        // 2) Update each user's userGroups (PUT per user)
        switchMap((updatedGroup) => {
          const updates: Observable<any>[] = [];

          memberIdsToAdd.forEach((uid) => {
            const user = this.allUsers.find((u) => u.user_id === uid);
            if (!user) return;

            if (!user.userGroups) user.userGroups = [];
            // avoid duplicates
            if (this.groupId) {
              if (!user.userGroups.includes(this.groupId)) {
                user.userGroups = [...user.userGroups, this.groupId];
              }
            } else {
              console.log('group undefined');
            }

            updates.push(this.userRepo.updateUserGroups(user));
          });

          return updates.length ? forkJoin(updates) : of([]);
        }),
        tap(() => {
          this.loading = false;
          // Navigate back to group details by group_id (route expects :id to be group_id)
          this.router.navigateByUrl(
            '/group/parent-group-details/group-details'
          );
        })
      )
      .subscribe({
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.errorMsg = 'Failed to add members. Please try again.';
        },
      });
  }

  cancel(): void {
    if (this.groupId) {
      this.router.navigate(['/group-details', this.groupId]);
    } else {
      this.router.navigate(['/show-groups']);
    }
  }

  trackByUserId = (_: number, u: User) => u.user_id ?? u.id ?? _;
}
