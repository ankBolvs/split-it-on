import { RestDataSource } from './model/restDatasource';
import { GroupDetailComponent } from './view/groupDetail/groupDetails.component';
import { ShowGroupsComponent } from './view/showGroups.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { ViewModule } from './view/view.module';
import { LoginComponent } from './view/login.component';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from './environment/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { GroupRepositroy } from './model/group.repository';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CreateGroupComponent } from './view/createGroups.component';
import { ShowGroupGuard } from './showGroupGuard';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [AppComponent, LoginComponent],
  imports: [
    HttpClientModule,
    BrowserModule,
    ViewModule,
    ReactiveFormsModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),

    RouterModule.forRoot([
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'create-group',
        component: CreateGroupComponent,
        canActivate: [ShowGroupGuard],
      },

      {
        path: 'show-groups',
        component: ShowGroupsComponent,
        canActivate: [ShowGroupGuard],
      },

      {
        path: 'group',
        loadChildren: () =>
          //used to lazy load an angular module
          import('./view/groupDetail/groupDetail.module').then(
            (m) => m.GroupDetailModule
          ),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: '**',
        redirectTo: '/login',
      },
    ]),
  ],
  providers: [HttpClient, ShowGroupGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
