import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>User Management</h2>
      
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="user-form">
        <div class="form-group">
          <label for="username">Username:</label>
          <input id="username" type="text" formControlName="username">
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" type="email" formControlName="email">
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input id="password" type="password" formControlName="password">
        </div>

        <div class="form-group">
          <label for="role">Role:</label>
          <select id="role" formControlName="role">
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>
        </div>

        <button type="submit">{{ editingUser ? 'Update' : 'Create' }} User</button>
        <button type="button" *ngIf="editingUser" (click)="cancelEdit()">Cancel</button>
      </form>

      <table class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users">
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button (click)="editUser(user)">Edit</button>
              <button (click)="deleteUser(user.id!)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
    }
    .user-form {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .users-table {
      width: 100%;
      border-collapse: collapse;
    }
    .users-table th, .users-table td {
      padding: 0.5rem;
      border: 1px solid #ddd;
    }
    button {
      margin-right: 0.5rem;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  userForm: FormGroup;
  editingUser: User | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['employee', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      if (this.editingUser) {
        this.userService.updateUser(this.editingUser.id!, this.userForm.value)
          .subscribe(() => {
            this.loadUsers();
            this.resetForm();
          });
      } else {
        this.userService.createUser(this.userForm.value)
          .subscribe(() => {
            this.loadUsers();
            this.resetForm();
          });
      }
    }
  }

  editUser(user: User) {
    this.editingUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      role: user.role
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  cancelEdit() {
    this.resetForm();
  }

  private resetForm() {
    this.editingUser = null;
    this.userForm.reset({ role: 'employee' });
    this.userForm.get('password')?.setValidators(Validators.required);
    this.userForm.get('password')?.updateValueAndValidity();
  }
}