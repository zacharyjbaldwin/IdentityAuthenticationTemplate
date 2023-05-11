import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'list'
})
export class ListPipe implements PipeTransform {

  transform(values: string[], noneText: string = 'none'): string {
    if (values.length === 0) return noneText;
    return values.join(', ');
  }

}
