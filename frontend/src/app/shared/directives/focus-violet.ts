//Name: Gustavo Miranda
//Student ID: 101488574

import { Directive, ElementRef, HostListener, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appFocusViolet]'
})
export class FocusViolet {
  private readonly hostSpot = inject(ElementRef<HTMLElement>);
  private readonly paintBrush = inject(Renderer2);

  @HostListener('focus')
  paintFocusGlow(): void {
    this.paintBrush.setStyle(this.hostSpot.nativeElement, 'borderColor', 'var(--orchid-line)');
    this.paintBrush.setStyle(
      this.hostSpot.nativeElement,
      'boxShadow',
      '0 0 0 4px rgba(140, 101, 255, 0.18)'
    );
  }

  @HostListener('blur')
  clearFocusGlow(): void {
    this.paintBrush.removeStyle(this.hostSpot.nativeElement, 'borderColor');
    this.paintBrush.removeStyle(this.hostSpot.nativeElement, 'boxShadow');
  }

}
