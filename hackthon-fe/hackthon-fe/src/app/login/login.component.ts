import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Adjust the path as necessary


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  // constructor(private router: Router) { }
  constructor(private authService: AuthService, private router: Router) { } // Inject AuthService here

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Form Data: ', this.loginForm.value);
      // Here, you can implement your authentication logic, e.g., call a service.

      // Assuming you have a service to validate login credentials
      // this.authService.login(this.loginForm.value).subscribe(success => {
      if (true) { // Replace this with your actual login logic
        this.authService.login(); // Here we should ideally pass username and password to login method

        // Navigate to the home page on successful login
        this.router.navigate(['/home']);
      } else {
        // Handle login failure (show error message)
      }
      // });
    } else {
      console.log('Form is not valid');
    }
  }

}
