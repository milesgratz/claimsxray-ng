import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'
import { RouterModule } from '@angular/router';

import { MonitoringModule } from './monitoring.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CopyrightComponent } from './copyright/copyright.component';
import { AboutComponent } from './about/about.component';
import { TokenRequestComponent } from './token-request/token-request.component';
import { TokenComponent } from './token/token.component';
import { SessionComponent } from './session/session.component';
import { PrivacyComponent } from './privacy/privacy.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    HeaderComponent,
    FooterComponent,
    CopyrightComponent,
    AboutComponent,
    TokenRequestComponent,
    TokenComponent,
    SessionComponent,
    PrivacyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'token', component: TokenComponent }
    ]),
    MonitoringModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
