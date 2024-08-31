import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'zeroPad',
  standalone: true,
})
export class ZeroPadPipe implements PipeTransform {
  transform(value: number, totalLength: number = 6): string {
    return value.toString().padStart(totalLength, '0');
  }
}
