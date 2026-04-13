//Name: Gustavo Miranda
//Student ID: 101488574

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plumSalary'
})
export class PlumSalaryPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const numericSalary = Number(value);

    if (!Number.isFinite(numericSalary)) {
      return '--';
    }

    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0
    }).format(numericSalary);
  }
}
