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
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  form: FormGroup;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private cartService: CartService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.form.valid) {
      this.auth
        .login(this.form.value.email!, this.form.value.password!)
        .subscribe({
          next: () => {
            // If the guest had items in localStorage, submit them as an order now
            if (this.cartService.items.length > 0) {
              this.cartService.submitOrder().subscribe({
                next: (cmd) => {
                  console.log(
                    `[Cart] Pending cart flushed → Command #${cmd.commandId}`
                  );
                },
                error: (err) => {
                  console.error('[Cart] Failed to flush pending cart', err);
                },
              });
            }

            // Navigate based on role
            this.auth.getUserRole() === '1'
              ? this.router.navigate(['/dashboard'])
              : this.router.navigate(['/products']);
          },
          error: (err) => console.error('Login failed', err),
        });
    }
  }
}
