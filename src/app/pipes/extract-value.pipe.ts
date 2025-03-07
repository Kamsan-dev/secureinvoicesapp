import { Pipe, PipeTransform } from '@angular/core';
import { Invoice } from '../interfaces/invoice.interface';

@Pipe({
  name: 'ExtractArrayValue',
  standalone: true,
})
export class ExtractArrayValue implements PipeTransform {
  transform(value: any, args: string): any {
    let total: number = 0;
    if (args === 'number') {
      let numberArray: number[] = [];
      for (let i = 0; i < value; i++) {
        numberArray.push(i);
      }
      return numberArray;
    }
    if (args === 'invoices') {
      value.forEach((invoice: Invoice) => {
        total += invoice.total;
      });
      return total.toFixed(2);
    }
    return 0;
  }
}
