import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, delay, lastValueFrom, Subject } from 'rxjs';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { EditCustomer } from 'src/app/interfaces/customer.interface';
import { State } from 'src/app/interfaces/state';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCustomerComponent implements OnInit {
  private dataSubject = new BehaviorSubject<CustomHttpResponse<EditCustomer> | undefined>(undefined);
  public editCustomerState = signal<State<CustomHttpResponse<EditCustomer>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  // forms
  public editCustomerForm!: FormGroup;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private toasterService: ToasterService,
  ) {}

  public ngOnInit(): void {
    this.editCustomerForm = this.fb.group({
      name: [''],
      email: [''],
      phone: [''],
      type: [''],
      status: [''],
      imageUrl: ['https://img.freepik.com/free-icon/user_318-159711.jpg'],
      address: [''],
    });
  }

  public async onEditCustomerSubmit(): Promise<void> {
    this.loading.set(true);
    this.editCustomerState().dataState = DataState.LOADING;
    try {
      this.editCustomerForm.disable();
      const response = await lastValueFrom(this.customerService.editCustomer(this.editCustomerForm.value).pipe(delay(1000)));
      this.dataSubject.next({ ...response, data: response.data });
      this.editCustomerState.set({
        ...this.editCustomerState(),
        dataState: DataState.LOADED,
        appData: response,
      });
      this.toasterService.show('success', 'Success !', this.editCustomerState().appData?.message ?? '');
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.editCustomerState.set({
          ...this.editCustomerState(),
          appData: this.dataSubject.value,
          dataState: DataState.ERROR,
          error: error.error.reason,
        });
      }
    } finally {
      this.loading.set(false);
      this.editCustomerForm.enable();
      this.editCustomerForm.reset({ type: 'INDIVIDUAL', status: 'ACTIVE' });
      this.editCustomerForm.markAsPristine();
    }
  }
}
