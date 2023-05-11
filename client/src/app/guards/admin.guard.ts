import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(): Promise<boolean> | boolean {
    if (this.authenticationService.getIsAuthenticated() === true && this.authenticationService.getRoles()?.includes('Admin')) {
      return true;
    } else {
      return this.router.navigateByUrl('/login');
    }
  }
  
}
