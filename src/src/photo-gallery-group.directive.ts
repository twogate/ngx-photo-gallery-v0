import { Directive } from '@angular/core'
import * as PhotoSwipe from 'photoswipe'
import * as PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default'
import { LightboxService } from './lightbox/lightbox.service'

export interface GalleryImage {
  src: string
  w: number
  h: number
  doGetSlideDimensions?: boolean
}

export interface GalleryItem {
  element: HTMLElement
  imageUrl: string
}

@Directive({
  selector: '[photoGalleryGroup]',
})
export class PhotoGalleryGroupDirective {
  gallery: PhotoSwipe
  galleryElements: GalleryItem[] = []
  galleryImages: GalleryImage[] = []

  constructor(private lightboxService: LightboxService) {}

  registerGalleryItem(item: GalleryItem): number {
    this.galleryImages.push({
      src: item.imageUrl,
      w: 0,
      h: 0,
      doGetSlideDimensions: true,
    })
    return this.galleryElements.push(item) - 1
  }

  async openPhotoSwipe(idx: number) {
    const options: PhotoSwipe.Options = {
      index: idx,
      history: false,
      closeEl: true,
      captionEl: false,
      fullscreenEl: false,
      zoomEl: true,
      shareEl: false,
      counterEl: true,
      arrowEl: false,
      preloaderEl: true,

      getThumbBoundsFn: (idx: number) => {
        const thumbnail = this.galleryElements[idx].element
        const pageYScroll = window.pageYOffset || document.documentElement.scrollTop
        const rect = thumbnail.getBoundingClientRect()

        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
      },
    }
    const photoSwipe = this.lightboxService.getLightboxElement()

    const targetImage = await loadImage(this.galleryImages[idx].src)
    this.galleryImages[idx].w = targetImage.naturalWidth
    this.galleryImages[idx].h = targetImage.naturalHeight
    delete this.galleryImages[idx].doGetSlideDimensions

    this.gallery = new PhotoSwipe(photoSwipe, PhotoSwipeUI_Default, this.galleryImages, options)
    this.gallery.listen('gettingData', (idx, slide) => {
      if (slide.doGetSlideDimensions) {
        setTimeout(() => {
          this.getSlideDimensions(slide)
        }, 300)
      }
    })
    this.gallery.listen('imageLoadComplete', (idx, slide) => {
      if (slide.doGetSlideDimensions) {
        this.getSlideDimensions(slide)
      }
    })
    this.gallery.init()
  }

  async getSlideDimensions(slide: any) {
    if (!slide.doGetSlideDimensions) {
      return
    }

    const image = await loadImage(slide.src).catch(() => null)

    slide.doGetSlideDimensions = false

    slide.w = image.naturalWidth
    slide.h = image.naturalHeight

    this.gallery.invalidateCurrItems()
    this.gallery.updateSize(true)
  }
}

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = e => reject(e)
    image.src = path
  })
}
