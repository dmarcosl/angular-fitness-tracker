import {AuthData} from './auth-data.model';
import {Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import {TrainingService} from '../training/training.service';
import {UiService} from '../shared/ui.service';

@Injectable()
export class AuthService {

  authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(private router: Router,
              private angularFireAuth: AngularFireAuth,
              private trainingService: TrainingService,
              private uiService: UiService) {
  }

  /**
   * Init the subscription of authState to manage login and logout actions
   */
  initAuthListener(): void {
    this.angularFireAuth.authState.subscribe(
      user => {
        if (user) {
          this.isAuthenticated = true;
          this.authChange.next(true);
          this.router.navigate(['/training']);
        } else {
          this.trainingService.cancelSubscriptions();
          this.isAuthenticated = false;
          this.authChange.next(false);
          this.router.navigate(['/login']);
        }
      });
  }

  /**
   * Create an auth for the user and insert the user data in the database
   *
   * @param authData Registration data
   */
  registerUser(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);

    this.angularFireAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.uiService.loadingStateChanged.next(false);
      })
      .catch(error => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  /**
   * Check the auth provided and login the user
   *
   * @param authData Login data
   */
  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);

    this.angularFireAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.uiService.loadingStateChanged.next(false);
      })
      .catch(error => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  /**
   * Logout the user
   */
  logout() {
    this.angularFireAuth.auth.signOut();
  }

  /**
   * Check if the user is authenticated
   */
  isAuth() {
    return this.isAuthenticated;
  }
}
