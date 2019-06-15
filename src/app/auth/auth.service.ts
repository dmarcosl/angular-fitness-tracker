import {AuthData} from './auth-data.model';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import {TrainingService} from '../training/training.service';
import {UiService} from '../shared/ui.service';
import {Store} from '@ngrx/store';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';
import * as Auth from './auth.actions';

@Injectable()
export class AuthService {

  constructor(private router: Router,
              private angularFireAuth: AngularFireAuth,
              private trainingService: TrainingService,
              private uiService: UiService,
              private store: Store<fromRoot.State>) {
  }

  /**
   * Init the subscription of authState to manage login and logout actions
   */
  initAuthListener(): void {
    this.angularFireAuth.authState.subscribe(
      user => {
        if (user) {
          this.store.dispatch(new Auth.SetAuthenticated());
          this.router.navigate(['/training']);
        } else {
          this.trainingService.cancelSubscriptions();
          this.store.dispatch(new Auth.SetUnauthenticated());
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
    this.store.dispatch(new UI.StartLoading());

    this.angularFireAuth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.store.dispatch(new UI.StopLoading());
      })
      .catch(error => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  /**
   * Check the auth provided and login the user
   *
   * @param authData Login data
   */
  login(authData: AuthData) {
    this.store.dispatch(new UI.StartLoading());

    this.angularFireAuth.auth.signInWithEmailAndPassword(authData.email, authData.password)
      .then(result => {
        this.store.dispatch(new UI.StopLoading());
      })
      .catch(error => {
        this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar(error.message, null, 3000);
      });
  }

  /**
   * Logout the user
   */
  logout() {
    this.angularFireAuth.auth.signOut();
  }
}
