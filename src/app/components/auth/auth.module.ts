import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { VerifyComponent } from './verify/verify.component';
import { AuthRoutingModule } from './auth-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, VerifyComponent, ResetpasswordComponent],
  imports: [SharedModule, AuthRoutingModule, InputTextModule, ButtonModule, MessageModule],
})
export class AuthModule {}
