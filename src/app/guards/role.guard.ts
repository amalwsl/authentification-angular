import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getCurrentUser();
    const allowedRoles = route.data['roles'] as string[];

    if (!user || !allowedRoles.includes(user.role)) {
      if (user?.role === 'admin') {
        this.router.navigate(['/users']);
      } else if (user?.role === 'employee') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }
}