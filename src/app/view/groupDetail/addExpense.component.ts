import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupRepositroy } from '../../model/group.repository';
import { UserService } from '../../services/user.service';
import { Expense } from '../../model/expense.model';
import { User } from '../../model/user.model';
import { GroupDataService } from '../../services/groupdata.service';

@Component({
  selector: 'add-expense',
  templateUrl: './addExpense.component.html',
  styleUrls: ['./addExpense.component.css'],
})
export class AddExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  groupId?: string;
  groupUsers: User[] = [];
  currentUserId: string = '';

  // UI state
  loading = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private groupRepo: GroupRepositroy,
    private userService: UserService,
    private groupDetail: GroupDataService
  ) {}

  ngOnInit(): void {
    // group id from param or query
    this.groupId = this.groupDetail.getGroupId();

    this.currentUserId = this.userService.getUserId();

    // load group members from repo cache
    this.groupUsers = this.groupRepo.getGroupUsersData(this.groupId);

    // build form
    this.expenseForm = this.fb.group({
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      amount: new FormControl('', [Validators.required, Validators.min(1)]),
      toggle: new FormControl('all'), // default state
      users: this.fb.array([]), // checkboxes
    });

    this.addUserCheckboxes();
  }

  get usersArray(): FormArray {
    return this.expenseForm.get('users') as FormArray;
  }

  private addUserCheckboxes(): void {
    this.groupUsers.forEach(() => this.usersArray.push(new FormControl(false)));
  }

  onSubmit(): void {
    console.log('group id on submit ' + this.groupId);
    if (this.expenseForm.invalid) return;

    this.loading = true;
    const formValue = this.expenseForm.value;

    let selectedUsers: string[];
    if (formValue.toggle === 'all') {
      selectedUsers = this.groupUsers.map((u) => u.user_id!);
    } else {
      selectedUsers = this.groupUsers
        .filter((_, i) => formValue.users[i])
        .map((u) => u.user_id!);
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: formValue.description,
      amount: formValue.amount,
      paid_by: this.currentUserId,
      group_id: this.groupId,
      date: new Date().toISOString(),
      users: selectedUsers,
    };

    this.groupRepo.addExpense(newExpense).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/group/parent-group-details/group-details']);
      },
      error: (err) => {
        console.error('Failed to add expense:', err);
        this.errorMsg = 'Failed to add expense. Please try again.';
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/group/parent-group-details/group-details']);
  }
}
