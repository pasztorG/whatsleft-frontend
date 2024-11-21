import { Component, Input } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() householdName: string = '';
  isMenuOpen: boolean = false;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  getCurrentMonth(): string {
    return new Date().toLocaleString('default', { month: 'long' });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.isMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
