import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material.module';
import {WelcomeComponent} from './welcome/welcome.component';
import {HeaderComponent} from './navigation/header/header.component';
import {SidenavListComponent} from './navigation/sidenav-list/sidenav-list.component';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {UiService} from './shared/ui.service';
import {AuthModule} from './auth/auth.module';
import {TrainingService} from './training/training.service';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AuthService} from './auth/auth.service';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {StoreModule} from '@ngrx/store';
import {reducers} from './app.reducer';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    HeaderComponent,
    SidenavListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AuthModule,
    StoreModule.forRoot(reducers),
  ],
  providers: [
    UiService,
    AuthService,
    TrainingService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
