import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey = 'adminLoggedIn';
  private readonly tokenStorageKey = 'authToken';
  private loggedInSubject = new BehaviorSubject<boolean>(this.getStoredLoginState());
  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredLoginState(): boolean {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(this.storageKey) === 'true';
  }

  private setLoggedInState(value: boolean): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(this.storageKey, String(value));
    }
    this.loggedInSubject.next(value);
  }

  login(emailOrUsername: string, password: string): Observable<any> {
    var fullPath=environment.baseUrl + '/Users/login'

    return this.http.post(fullPath, {
      emailOrUsername,
      password,
    }).pipe(
      tap((response: any) => {
        const token = response?.token ?? response?.accessToken ?? response?.data?.token;
        if (token) {
          this.setAuthToken(token);
        }
        this.setLoggedInState(true);
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.removeItem(this.storageKey);
      window.localStorage.removeItem(this.tokenStorageKey);
    }
    this.loggedInSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  getBearerToken(): string | null {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(this.tokenStorageKey);
  }

  setAuthToken(token: string): void {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(this.tokenStorageKey, token);
    }
  }
}
