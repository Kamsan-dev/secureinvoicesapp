import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { VerifyComponent } from './verify/verify.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, VerifyComponent, ResetpasswordComponent],
  imports: [SharedModule, AuthRoutingModule],
})
export class AuthModule {}
