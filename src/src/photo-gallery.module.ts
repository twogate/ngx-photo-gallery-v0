import { NgModule } from '@angular/core'
import { LightboxComponent } from './lightbox/lightbox.component'
import { LightboxService } from './lightbox/lightbox.service'
import { PhotoGalleryDirective } from './photo-gallery.directive'
import { PhotoGalleryGroupDirective } from './photo-gallery-group.directive'

@NgModule({
  declarations: [LightboxComponent, PhotoGalleryDirective, PhotoGalleryGroupDirective],
  providers: [LightboxService],
  imports: [],
  exports: [PhotoGalleryDirective, PhotoGalleryGroupDirective],
  entryComponents: [LightboxComponent],
})
export class PhotoGalleryModule {}
