import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5056/api/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
        })
      );
  }

  register(username: string, password: string): Observable<any> {
    console.log('Sending register request to:', `${this.apiUrl}/register`);
    return this.http.post<any>(`${this.apiUrl}/register`, { username, password })
      .pipe(
        tap(response => {
          console.log('Register response:', response);
          localStorage.setItem('token', response.token);
          localStorage.setItem('householdId', response.householdId);
          localStorage.setItem('householdName', response.householdName);
        }),
        catchError(error => {
          console.error('Register error:', error);
          throw error;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('householdId');
    localStorage.removeItem('householdName');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
