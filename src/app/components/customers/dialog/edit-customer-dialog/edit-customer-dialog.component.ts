import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { delay, finalize, Subject, takeUntil } from 'rxjs';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { EditCustomer } from 'src/app/interfaces/customer.interface';
import { State } from 'src/app/interfaces/state';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-edit-customer-dialog',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule, CommonModule, InputTextModule, InputTextareaModule, DropdownModule],
  templateUrl: './edit-customer-dialog.component.html',
  styleUrl: './edit-customer-dialog.component.scss',
})
export class EditCustomerDialogComponent implements OnInit {
  public editCustomerState = signal<State<CustomHttpResponse<EditCustomer>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });
  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();
  public editCustomerForm!: FormGroup;

  //dropdown customer type
  public customerTypeItems = signal<String[]>(['Individual', 'Institution']);

  //dropdwon customer type
  public customerStatusItems = signal<String[]>(['Active', 'Inactive', 'Pending', 'Banned']);

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    private customerService: CustomerService,
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

  public onEditCustomerSubmit() {
    this.loading.set(true);
    this.editCustomerState().dataState = DataState.LOADING;
    this.editCustomerForm.disable();
    this.customerService
      .editCustomer(this.editCustomerForm.value)
      .pipe(
        delay(1000),
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
          this.editCustomerForm.enable();
          this.editCustomerForm.markAsPristine();
          this.editCustomerForm.reset({ type: 'Individual', status: 'Active' });
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<EditCustomer>) => {
          this.editCustomerState.set({
            ...this.editCustomerState(),
            dataState: DataState.LOADED,
            appData: response,
          });
          this.toasterService.show('success', 'Success !', this.editCustomerState().appData?.message ?? '');
        },

        error: (error: HttpErrorResponse) => {
          this.editCustomerState.set({
            ...this.editCustomerState(),
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
          this.toasterService.show('error', 'Error !', this.editCustomerState().appData?.reason ?? '');
        },
      });
  }
}
