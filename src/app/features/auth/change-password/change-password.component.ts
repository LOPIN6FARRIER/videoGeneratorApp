import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  changePasswordForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor() {
    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  get oldPassword() {
    return this.changePasswordForm.get('oldPassword')!;
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword')!;
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword')!;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { oldPassword, newPassword } = this.changePasswordForm.value;

      this.authService.changePassword(oldPassword, newPassword).subscribe({
        next: (success) => {
          this.loading.set(false);
          if (success) {
            this.successMessage.set('Password changed successfully! Redirecting to login...');
            // The auth service will automatically redirect to login
          } else {
            this.errorMessage.set('Invalid current password or password change failed');
          }
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set('Failed to change password. Please try again.');
          console.error('Change password error:', error);
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
