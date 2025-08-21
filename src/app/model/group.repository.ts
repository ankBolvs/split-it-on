import { Injectable } from '@angular/core';
import { RestDataSource } from './restDatasource';
import { User } from './user.model';
import { Group } from './group.model';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Expense } from './expense.model';

@Injectable()
export class GroupRepositroy {
  private usersData: User[] = [];
  public groupSubject = new BehaviorSubject<any>(null);
  private groupsData$ = new BehaviorSubject<Group[]>([]);
private expensesData: { [groupId: string]: Expense[] } = {};
private expensesSubjects: { [groupId: string]: BehaviorSubject<Expense[]> } = {};
  constructor(private res: RestDataSource) {
    // load users once (non-blocking)
    this.res.getUsers().subscribe((data) => (this.usersData = data));
    // initial groups
    this.loadGroups().subscribe();
  }

  /** observable for components */
  get groups$(): Observable<Group[]> {
    return this.groupsData$.asObservable();
  }

  /** load groups from backend and update BehaviorSubject */
  loadGroups(): Observable<Group[]> {
    return this.res.getGroups().pipe(tap((groups) => this.groupsData$.next(groups)));
  }

  /** add a new group */
  addGroup(group: Group): Observable<Group> {
    const current = this.groupsData$.getValue();
    const lastGroup = current[current.length - 1];
    const lastId = lastGroup ? parseInt(lastGroup.group_id || '100', 10) : 100;

    group.group_id = (lastId + 1).toString();
    group.id = group.group_id;

    return this.res.addGroup(group).pipe(
      tap((newGroup) => {
        this.groupsData$.next([...current, newGroup]);
      })
    );
  }

  /** get groups as array (one-shot) */
  getGroups(): Observable<Group[]> {
    return this.res.getGroups();
  }

  /** get one group by group_id (from cache) */
  getGroup(groupId: string): Group | undefined {
    return this.groupsData$.getValue().find((g) => g.group_id == groupId);
  }

  /** get user by user_id */
  getUser(userId: string) {
    return this.usersData.find((u) => u.user_id == userId);
  }

  /** map members to user objects */
  getGroupUsersData(groupId: string): User[] {
    const group = this.getGroup(groupId);
    if (!group || !group.members) return [];
    return group.members
      .map((uid) => this.usersData.find((u) => u.user_id === uid))
      .filter((u): u is User => !!u);
  }

  getGroupExpenses(groupId: string) {
    return this.res.getExpensesByGroup(Number(groupId));
  }

  /** put full group to server and emit updated list */
  updateGroup(groupId: string, updatedGroup: Group): Observable<Group> {
    return this.res.updateGroup(groupId, updatedGroup).pipe(
      tap((updated) => {
        const list = this.groupsData$.getValue();
        const idx = list.findIndex((g) => (g.group_id ?? g.id) === groupId);
        if (idx >= 0) {
          const next = list.slice();
          next[idx] = updated;
          this.groupsData$.next(next);
          this.groupSubject.next(updated);
        } else {
          this.groupsData$.next([...list, updated]);
          this.groupSubject.next(updated);
        }
      })
    );
  }

  /** convenience for adding members and saving (PUT) */
  addMembersToGroup(groupId: string, userIds: string[]): Observable<Group> {
    const group = this.getGroup(groupId);
    const existing = new Set(group?.members ?? []);
    const merged = [...existing, ...userIds].map((x) => x); // unique

    const updatedGroup: Group = {
      ...(group ?? { group_id: groupId } as Group),
      id: group?.id ?? groupId,
      members: merged,
      group_name: group?.group_name,
      description: group?.description,
      category: group?.category,
      created_by: group?.created_by,
      expenses: group?.expenses ?? [],
    };

    return this.updateGroup(groupId, updatedGroup);
  }

  deleteGroup(groupId?: string): Observable<any> {
    return this.res.deleteGroup(groupId);
  }
  getExpenses$(groupId: string): Observable<Expense[]> {
  if (!this.expensesSubjects[groupId]) {
    this.expensesSubjects[groupId] = new BehaviorSubject<Expense[]>([]);
    this.refreshExpenses(groupId).subscribe();
  }
  return this.expensesSubjects[groupId].asObservable();
}

refreshExpenses(groupId: string): Observable<Expense[]> {
  return this.res.getExpensesByGroup(Number(groupId)).pipe(
    tap((expenses) => {
      this.expensesData[groupId] = expenses;
      if (this.expensesSubjects[groupId]) {
        this.expensesSubjects[groupId].next(expenses);
      }
    })
  );
}

addExpense(expense: Expense): Observable<Expense> {
  // ✅ ensure it has a unique id before sending to json-server
  if (!expense.id) {
    expense.id = Date.now().toString();
  }

  return this.res.addExpense(expense).pipe(
    tap((created) => {
      const gid = created.group_id!;
      if (!this.expensesData[gid]) this.expensesData[gid] = [];
      this.expensesData[gid].push(created);
      if (this.expensesSubjects[gid]) {
        this.expensesSubjects[gid].next([...this.expensesData[gid]]);
      }
    })
  );
}

}
