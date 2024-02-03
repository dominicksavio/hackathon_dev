import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component'; // Import HomeComponent
import { AuthGuard } from './services/auth.guard'; // Import the guard

const routes: Routes = [
  {
    path : 'login', component: LoginComponent
  },
  {
    // path:'', component:LoginComponent
    path:'', component:HomeComponent
  },
  { 
    path: 'home', component: HomeComponent , canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
