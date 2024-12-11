import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { lastValueFrom, Subject } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { Profile } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { State } from 'src/app/interfaces/state';
import { User } from 'src/app/interfaces/user';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  public customerState = signal<State<CustomHttpResponse<Profile>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
  ) {}
  public ngOnInit(): void {
    this.loadCustomers();
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  //#region customers
  private async loadCustomers(): Promise<void> {
    //this.customerState().dataState = DataState.LOADING;
    this.loading.set(true);
    try {
      const response = await lastValueFrom(this.customerService.getCustomers());
      console.log(response);
      this.customerState.set({
        ...this.customerState(),
        dataState: DataState.LOADED,
        appData: response,
      });
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.customerState.set({
          ...this.customerState(),
          dataState: DataState.ERROR,
          error: error.error.reason,
        });
      } else {
        console.log('An unknown error occurred', error);
      }
    } finally {
      this.loading.set(false);
    }
  }
  //#endregion

  //#region UserInformations
  public getUserName(): string {
    return this.customerState().appData?.data?.user?.firstName + ' ' + this.customerState().appData?.data?.user?.lastName;
  }

  public getUserPictureProfile(): string {
    return this.customerState().appData?.data?.user?.imageUrl || 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }

  public getUserInformations(): User | null {
    return this.customerState().appData?.data?.user || null;
  }
}
