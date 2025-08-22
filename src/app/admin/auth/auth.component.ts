import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/authService';
import { noSpecialChars } from '../../validators/no-special-chars.validators';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  submittedForm: boolean = false;
  authenticationData: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.authenticationData = this.fb.group({
      admin_name: new FormControl('', [
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

  submitForm() {
    this.submittedForm = true;
    if (this.authenticationData.valid) {
      this.auth
        .authenticate(
          this.authenticationData.value.admin_name ?? '',
          this.authenticationData.value.password ?? '', 
          "admin"
        )
        .subscribe((response) => {
          if (response) {
            console.log(response);
            this.router.navigateByUrl('/admin/show-all-groups');
          }
          // this.errorMessage = 'Authentication Failed';
        });
    } else {
      console.log('Not working');
    }
  }
}
