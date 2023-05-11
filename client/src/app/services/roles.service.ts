import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from '../models/role';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }

  public getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.apiUrl}/admin/roles`);
  }

  public setRolesForUser(user: User, roles: string[]): Observable<Role[]> {
    return this.http.patch<Role[]>(`${environment.apiUrl}/admin/users/edit-roles/${user.userId}`, { roles });
  }
}
