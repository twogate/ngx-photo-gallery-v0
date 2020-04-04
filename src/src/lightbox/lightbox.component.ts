import { Component, ViewChild, ElementRef } from '@angular/core'

@Component({
  selector: 'lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.scss'],
})
export class LightboxComponent {
  @ViewChild('Lightbox', { static: true }) element: ElementRef

  constructor() {}
}
