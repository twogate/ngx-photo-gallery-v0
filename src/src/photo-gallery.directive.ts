import { Directive, HostListener, Input, ElementRef, AfterContentInit, OnDestroy } from '@angular/core'
import { PhotoGalleryGroupDirective } from './photo-gallery-group.directive'

@Directive({
  selector: '[photoGallery]',
})
export class PhotoGalleryDirective implements AfterContentInit, OnDestroy {
  @Input('photoGallery') imageUrl: string
  @Input() photoGalleryTrackBy: string
  id: string

  constructor(private el: ElementRef, private photoGalleryGroup: PhotoGalleryGroupDirective) {}

  ngAfterContentInit() {
    this.id = this.photoGalleryTrackBy || this.imageUrl
    this.photoGalleryGroup.registerGalleryItem({
      id: this.id,
      element: this.el.nativeElement,
      imageUrl: this.imageUrl,
    })
  }

  ngOnDestroy() {
    this.photoGalleryGroup.unregisterGalleryItem(this.id)
  }

  @HostListener('click')
  openPhotoSwipe() {
    this.photoGalleryGroup.openPhotoSwipe(this.id)
  }
}
