import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'], // reuse same CSS
})
export class RegisterComponent {
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  register() {
    if (this.form.valid) {
      this.auth
        .register(this.form.value.email!, this.form.value.password!)
        .subscribe({
          next: () => {
            console.log('Registration successful');
            this.router.navigate(['/login']);
          },
          error: (err) => console.error('Registration failed', err),
        });
    }
  }
}
