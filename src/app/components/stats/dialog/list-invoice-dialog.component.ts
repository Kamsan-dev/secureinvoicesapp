import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { Invoice } from 'src/app/interfaces/invoice.interface';

@Component({
  selector: 'app-list-invoice-dialog',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './list-invoice-dialog.component.html',
  styleUrl: './list-invoice-dialog.component.scss',
})
export class ListInvoiceDialogComponent {
  public invoices: Invoice[] = [];
  config = inject(DynamicDialogConfig);

  constructor() {
    this.invoices = this.config.data;
    console.log(this.invoices);
  }
}
