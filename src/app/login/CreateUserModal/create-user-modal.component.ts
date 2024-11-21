import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.css']
})
export class CreateUserModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<{token: string, householdId: string, householdName: string}>();
  createUserForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
  }

  async onSubmit() {
    if (this.createUserForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const payload = {
        username: this.createUserForm.get('username')?.value,
        password: this.createUserForm.get('password')?.value
      };

      this.authService.register(payload.username, payload.password)
        .subscribe({
          next: (response) => {
            console.log('Registration successful:', response);
            this.userCreated.emit(response);
            this.onClose();
          },
          error: (error) => {
            console.error('Registration error:', error);
            this.errorMessage = error.error?.message || error.error || 'Failed to create user. Please try again.';
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          }
        });
    }
  }

  onClose() {
    this.close.emit();
  }
}