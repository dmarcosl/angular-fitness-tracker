import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../auth.service';
import {UiService} from '../../shared/ui.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  isLoading: boolean;
  private loadingSubscription: Subscription;

  constructor(private authService: AuthService,
              private uiService: UiService) {
  }

  ngOnInit() {
    this.isLoading = false;
    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(
      response => {
        this.isLoading = response;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

  onSubmit(form: NgForm): void {
    this.authService.login({
      email: form.value.email,
      password: form.value.password
    });
  }

}
