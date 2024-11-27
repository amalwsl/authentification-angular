import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">User Management System</div>
      <div class="navbar-menu">
        <span class="user-info" *ngIf="currentUser">
          {{ currentUser.username }} ({{ currentUser.role }})
        </span>
        <button class="logout-button" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: #2c3e50;
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .navbar-brand {
      font-size: 1.25rem;
      font-weight: bold;
    }
    .navbar-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-info {
      font-size: 0.9rem;
    }
    .logout-button {
      background-color: #e74c3c;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .logout-button:hover {
      background-color: #c0392b;
    }
  `]
})
export class NavComponent {
  get currentUser() {
    return this.authService.getCurrentUser();
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}