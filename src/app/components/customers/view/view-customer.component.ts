import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer, ViewCustomer } from 'src/app/interfaces/customer.interface';
import { State } from 'src/app/interfaces/state';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-view-customer',
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCustomerComponent implements OnInit {
  public customerState = signal<State<CustomHttpResponse<ViewCustomer>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  //customer
  public customerId = signal<number>(-1);
  private readonly CUSTOMER_ID = 'id';

  //form
  public customerForm!: FormGroup;
  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    // Get the id from the route
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const id = Number(params.get(this.CUSTOMER_ID));
      this.customerId.set(id);
      this.loadCustomerData();
    });

    this.customerForm = this.fb.group({
      customerId: [''],
      name: [''],
      email: [''],
      imageUrl: [''],
      type: [''],
      status: [''],
      address: [''],
      phone: [''],
      createdAt: [''],
    });
  }

  //#region customer

  public async loadCustomerData(): Promise<void> {
    this.loading.set(true);
    this.customerState().dataState = DataState.LOADING;
    try {
      const response = await lastValueFrom(this.customerService.getCustomer(this.customerId()).pipe(delay(200)));
      console.log(response);
      this.customerState.set({
        ...this.customerState(),
        dataState: DataState.LOADED,
        appData: response,
      });
      this.populateForm();
      // if (this.customerState().appData?.data?.user.roleName !== 'ROLE_SYSADMIN') {
      //   this.customerForm.disable();
      // }
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

  public async onUpdateCustomer(): Promise<void> {
    this.loading.set(true);
    this.customerForm.disable();
    try {
      const response = await lastValueFrom(this.customerService.updateCustomer(this.customerForm.value).pipe(delay(800)));
      console.log(response);
      const invoices = this.customerState().appData?.data?.customer.invoices;
      if (response.data?.customer) {
        response.data.customer['invoices'] = invoices;
      }
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
      this.customerForm.enable();
      this.customerForm.markAsPristine();
    }
  }

  private populateForm(): void {
    const customer = this.customerState().appData?.data?.customer;

    if (customer) {
      this.customerForm.setValue({
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        type: customer.type,
        status: customer.status,
        createdAt: customer.createdAt || '',
        imageUrl: customer.imageUrl,
      });
    }
  }

  public getCustomerInformations(): Customer | undefined {
    return this.customerState().appData?.data?.customer;
  }

  public getCustomerPictureProfile(): string {
    return this.customerState().appData?.data?.customer?.imageUrl || 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }

  //#endregion
}
