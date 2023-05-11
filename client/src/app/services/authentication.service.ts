import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

interface AuthData {
  token: string;
  expirationDate: Date;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface LoginDto {
  token: string;
  expiresIn: number;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private isAuthenticated: boolean = false;
  private token: string | undefined;
  private firstname: string | undefined;
  private lastname: string | undefined;
  private email: string | undefined;
  private userId: string | undefined;
  private roles: string[] | undefined;
  private logoutTimer: any;

  public authenticationStatus = new Subject<boolean>();
  public loginError = new Subject<string>();
  public registerError = new Subject<string>();

  public getIsAuthenticated(): boolean { return this.isAuthenticated }
  public getToken(): string | undefined { return this.token; }
  public getUserId(): string | undefined { return this.userId; }
  public getEmail(): string | undefined { return this.email; }
  public getFirstName(): string | undefined { return this.firstname; }
  public getLastName(): string | undefined { return this.lastname; }
  public getRoles(): string[] | undefined { return this.roles }

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  public login(email: string, password: string, redirectTo?: string): void {
    this.http.post<LoginDto>(`${environment.apiUrl}/authentication/login`, { email: email, password: password }).subscribe({
      next: res => {
        this.token = res.token;
        
        if (this.token) {
          this.userId = res.userId;
          this.email = res.email;
          this.firstname = res.firstName;
          this.lastname = res.lastName;
          this.roles = res.roles;
          this.isAuthenticated = true;

          this.setAutoLogoutTimer(res.expiresIn);
          this.authenticationStatus.next(true);
          
          const expirationDate = new Date(new Date().getTime() + res.expiresIn * 1000);
          this.saveAuthData(this.token, expirationDate, this.userId, this.email, this.firstname, this.lastname, this.roles);

          this.router.navigateByUrl(redirectTo ? redirectTo : '/');
        }
      },
      error: () => { this.loginError.next('Login failed.'); }
    });
  }
  
  public autoLogin(): void {
    const authData = this.getAuthData();
    if (authData === null) return;

    const now = new Date();
    const expiresIn = authData.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authData.token;
      this.userId = authData.userId;
      this.email = authData.email;
      this.firstname = authData.firstName;
      this.lastname = authData.lastName;
      this.roles = authData.roles;

      this.isAuthenticated = true;
      this.authenticationStatus.next(true);
      this.setAutoLogoutTimer(expiresIn / 1000);
    } else {
      this.clearAuthData();
    }
  }
  
  public register(email: string, firstname: string, lastname: string, password: string): void {
    const body = {
      email: email,
      firstname: firstname,
      lastname: lastname,
      password: password
    };

    this.http.post(`${environment.apiUrl}/authentication/register`, body).subscribe({
      next: () => {
        this.login(email, password, '/profile');
      },
      error: (error) => {
        if (error.error.message === 'EMAIL_ALREADY_IN_USE') {
          this.registerError.next('That email address is already in use.');
        } else {
          this.registerError.next('Registration failed.');
        }
      }
    });
  }

  public changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    return this.http.put<boolean>(`${environment.apiUrl}/authentication/change-password`, { oldPassword, newPassword });
  }

  public logout(): void {
    this.isAuthenticated = false;
    this.token = undefined;
    this.userId = undefined;
    this.email = undefined;
    this.firstname = undefined;
    this.lastname = undefined;
    this.roles = undefined;
    this.authenticationStatus.next(false);
    this.clearAuthData();

    clearInterval(this.logoutTimer);

    this.router.navigateByUrl('/');
  }
  
  private setAutoLogoutTimer(seconds: number): void {
    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, seconds * 1000);
  }
  
  private saveAuthData(token: string, expirationDate: Date, userId: string, email: string, firstname: string, lastname: string, roles: string[]): void {
    const data = {
      token: token,
      expirationDate: expirationDate,
      userId: userId,
      email: email,
      firstname: firstname,
      lastname: lastname,
      roles: roles
    };
    
    localStorage.setItem('user', JSON.stringify(data));
  }
  
  private getAuthData(): AuthData | null {
    if (localStorage.getItem('user') !== null) {
      let data: AuthData = JSON.parse(localStorage.getItem('user')!);

      if (data.token == null || data.expirationDate == null) return null;

      return {
        token: data.token,
        expirationDate: new Date(data.expirationDate),
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: data.roles
      }
    }
    return null;
  }
  
  private clearAuthData(): void {
    localStorage.clear();
  }
}
