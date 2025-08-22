import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable } from 'rxjs';
import { RestDataSource } from '../model/restDatasource';
import { user } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private displayNameSource = new BehaviorSubject<string | null>(null);
  displayName$ = this.displayNameSource.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private datasource: RestDataSource
  ) {
    this.afAuth.authState.subscribe((user) => {
      const name = user?.displayName || null;
      this.displayNameSource.next(name);
    });
  }

  async googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await this.afAuth.signInWithPopup(provider);
    const name = result.user?.displayName || null;
    this.displayNameSource.next(name);
    return result;
  }

  async signOut() {
    this.displayNameSource.next(null);
    return await this.afAuth.signOut();
  }

  getDisplayName(): string | null {
    return this.displayNameSource.getValue();
  }

  // adding the authentication code

  authenticate(
    username: string,
    password: string,
    role: string
  ): Observable<boolean> {
    if (role === 'admin') {
      console.log(username);
      // console.log()
      return this.datasource.authenticateAdmin(username, password); // admin authentication
    } else {
      return this.datasource.authenticate(username, password); // user authentication
    }
  }

  authenticateUser(username: string, password: string): Observable<boolean> {
    return this.datasource.authenticate(username, password);
  }

  get authenticated(): boolean {
    return localStorage.getItem('admin_token') !== undefined;
  }

  get authenticatedUser(): boolean {
    return localStorage.getItem('user_token') !== undefined;
  }

  clear() {
    localStorage.removeItem('admin_token');
  }
}
