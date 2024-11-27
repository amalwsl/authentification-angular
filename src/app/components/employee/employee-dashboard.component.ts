import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="welcome-card">
        <h2>Welcome, {{ currentUser?.username }}!</h2>
        <div class="user-info">
          <p><strong>Role:</strong> {{ currentUser?.role }}</p>
          <p><strong>Email:</strong> {{ currentUser?.email }}</p>
        </div>
      </div>
      
      <div class="info-card">
        <h3>Employee Access</h3>
        <p>As an employee, you have access to:</p>
        <ul>
          <li>View your profile information</li>
          <li>Update your email address</li>
          <li>Change your password</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .welcome-card {
      background-color: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .user-info {
      margin-top: 1rem;
      line-height: 1.6;
    }
    .info-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .info-card h3 {
      color: #2c3e50;
      margin-bottom: 1rem;
    }
    .info-card ul {
      list-style-type: none;
      padding: 0;
    }
    .info-card li {
      margin-bottom: 0.5rem;
      padding-left: 1.5rem;
      position: relative;
    }
    .info-card li:before {
      content: "•";
      color: #007bff;
      position: absolute;
      left: 0;
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }
}