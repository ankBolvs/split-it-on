import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/authService';
import { UserService } from '../services/user.service';
import { user } from '@angular/fire/auth';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { noSpecialChars } from '../validators/no-special-chars.validators';

@Component({
  selector: 'app-root',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  currentUserId: string | null = '';
  currentUserName: string | null = '';
  id: string = '';
  authenticationData: any;
  loginAs: string = 'user';
  submittedForm: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private userDetails: UserService,
    private fb: FormBuilder,
    private userDetail: UserService
  ) {
    this.authenticationData = this.fb.group({
      user_name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        noSpecialChars,
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(16),
      ]),
    });
  }

  signInWithGoogle() {
    this.auth
      .googleSignIn()
      .then((res) => {
        console.log('Logged in:', res.user?.displayName);
        this.router.navigateByUrl('/group'); /* navigate(['/login-success']); */
      })
      .catch((err) => console.error('Login error:', err));
  }
  setUser(userId: string) {
    this.userDetails.setUser(userId, this.auth.getDisplayName());
    console.log(
      this.userDetails.getUserId() + ' ' + this.userDetails.getUserName()
    );
    this.router.navigateByUrl('/show-groups');
  }

  // signin code
  changeCurrentLogin(role: string): void {
    this.loginAs = role;
    this.submitForm();
  }

  submitForm() {
    this.submittedForm = true;
    if (this.authenticationData.valid) {
      this.auth
        .authenticate(
          this.authenticationData.value.user_name ?? '',
          this.authenticationData.value.password ?? '',
          this.loginAs ?? ''
        )
        .subscribe((response) => {
          if (response) {
            console.log(response);
            this.currentUserId = localStorage.getItem('user_id');
            this.currentUserName = this.authenticationData.value.user_name;
            if (this.currentUserId != null && this.loginAs == 'user') {
              this.userDetail.setUser(this.currentUserId, this.currentUserName);
              console.log(this.loginAs);
              this.router.navigateByUrl('/show-groups');
            } else if (this.loginAs == 'admin') {
              console.log('routing to admin panel');
              this.router.navigateByUrl('/admin/show-all-groups');
            } else {
              console.log('user undefined');
              this.router.navigateByUrl('/');
            }
          }
          // this.errorMessage = 'Authentication Failed';
        });
    } else {
      console.log('Not working');
    }
  }
}
