import { Directive, HostListener, Input, ElementRef } from '@angular/core'
import { PhotoGalleryGroupDirective } from './photo-gallery-group.directive'

@Directive({
  selector: '[photoGallery]',
})
export class PhotoGalleryDirective {
  @Input('photoGallery') imageUrl: string
  index: number

  constructor(private el: ElementRef, private photoGalleryGroup: PhotoGalleryGroupDirective) {}

  ngAfterContentInit() {
    this.index = this.photoGalleryGroup.registerGalleryItem({
      element: this.el.nativeElement,
      imageUrl: this.imageUrl,
    })
  }

  @HostListener('click')
  openPhotoSwipe() {
    this.photoGalleryGroup.openPhotoSwipe(this.index)
  }
}
