import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { authLoginAction, authMfaAction } from 'src/app/store/login/login.action';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { LoginState } from 'src/app/interfaces/appstate';
import { selectLoginState } from 'src/app/store/login/login.reducer';
import { selectCurrentUser } from 'src/app/store/login/login.reducer';
import { RouterModule } from '@angular/router';

@Component({
   selector: 'app-login',
   standalone: true,
   imports: [CommonModule, ReactiveFormsModule, RouterModule],
   templateUrl: './login.component.html',
   styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
   loginForm: FormGroup;
   verificationForm: FormGroup;
   loginState$: Observable<LoginState>;
   userEmail: string | undefined;

   constructor(
      private fb: FormBuilder,
      private store: Store,
   ) {
      this.loginForm = this.fb.nonNullable.group({
         email: ['dev@email.com', Validators.required],
         password: ['1234', Validators.required],
      });

      this.verificationForm = this.fb.nonNullable.group({
         code: ['', Validators.required],
      });

      this.loginState$ = this.store.select(selectLoginState);
   }
   ngOnInit(): void {
      this.store.select(selectCurrentUser).subscribe((user) => {
         this.userEmail = user?.email;
      });
   }

   onSubmitForm(): void {
      const request = {
         email: this.loginForm.value.email,
         password: this.loginForm.value.password,
      };
      this.store.dispatch(authLoginAction.login({ request }));
   }

   onSubmitVerifyCode(): void {
      console.log(this.verificationForm.value.code);

      const request = {
         email: this.userEmail,
         code: this.verificationForm.value.code,
      };
      this.store.dispatch(authMfaAction.verifyCode({ request }));
   }
}
