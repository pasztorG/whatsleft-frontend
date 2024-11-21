import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { CreateUserModalComponent } from './CreateUserModal/create-user-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CreateUserModalComponent]
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;
  showCreateUserModal = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response: any) => {
          console.log('Login successful');
          localStorage.setItem('householdName', response.householdName);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.loginError = 'Invalid username or password';
        }
      });
    }
  }

  openCreateUserModal() {
    this.showCreateUserModal = true;
  }

  closeCreateUserModal() {
    this.showCreateUserModal = false;
  }

  onUserCreated(response: {token: string, householdId: string, householdName: string}) {
    console.log('User created successfully');
    localStorage.setItem('householdName', response.householdName);
    this.router.navigate(['/home']);
  }
}
