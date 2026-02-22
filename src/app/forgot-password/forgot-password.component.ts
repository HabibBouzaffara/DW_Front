import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  loading = false;
  successMessage = '';
  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) {}

  reset() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) return;

    this.loading = true;

    const { email, oldPassword, newPassword } = this.form.value;

    this.auth.resetPassword(email!, oldPassword!, newPassword!).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Password updated successfully ✅';
        this.form.reset();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Password update failed ❌';
        console.error(err);
      },
    });
  }
}
