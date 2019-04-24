import { Directive, Output, Input, EventEmitter } from '@angular/core'
import * as PhotoSwipe from 'photoswipe'
import * as PhotoSwipeUI_Default from 'photoswipe/dist/photoswipe-ui-default'
import { LightboxService } from './lightbox/lightbox.service'

export interface GalleryImage {
  id: string
  src: string
  w: number
  h: number
  doGetSlideDimensions?: boolean
}

export interface GalleryItem {
  id: string
  element: HTMLElement
  image: GalleryImage
}

export interface GalleryShareButton {
  id: string
  label: string
  url: string
  download?: boolean
}

export interface GalleryOptions {
  // Core Options
  index?: number
  getThumbBoundsFn?: (index: number) => { x: number; y: number; w: number }
  showHideOpacity?: boolean
  showAnimationDuration?: number
  hideAnimationDuration?: number
  bgOpacity?: number
  spacing?: number
  allowPanToNext?: boolean
  maxSpreadZoom?: number
  getDoubleTapZoom?: (isMouseClick: boolean, item: any) => number
  loop?: boolean
  pinchToClose?: boolean
  closeOnScroll?: boolean
  closeOnVerticalDrag?: boolean
  mouseUsed?: boolean
  escKey?: boolean
  arrowKeys?: boolean
  history?: boolean
  galleryUID?: number
  galleryPIDs?: boolean
  errorMsg?: string
  preload?: number[]
  mainClass?: string
  getNumItemsFn?: () => any
  focus?: boolean
  isClickableElement?: (el: any) => boolean
  modal?: boolean

  // UI Options
  barsSize?: { top: number; bottom?: 'auto' }
  timeToIdle?: number
  timeToIdleOutside?: number
  loadingIndicatorDelay?: number
  addCaptionHTMLFn?: (item: any, captionEl: any, isFake: boolean) => boolean
  closeEl?: boolean
  captionEl?: boolean
  fullscreenEl?: boolean
  zoomEl?: boolean
  shareEl?: boolean
  counterEl?: boolean
  arrowEl?: boolean
  preloaderEl?: boolean
  tapToClose?: boolean
  tapToToggleControls?: boolean
  clickToCloseNonZoomable?: boolean
  closeElClasses?: string[]
  indexIndicatorSep?: string
  shareButtons?: GalleryShareButton[]
  getImageURLForShare?: (shareButtonData: GalleryShareButton[]) => string
  getPageURLForShare?: (shareButtonData: GalleryShareButton[]) => string
  getTextForShare?: (shareButtonData: GalleryShareButton[]) => string
  parseShareButtonOut?: (shareButtonData: GalleryShareButton[], shareButtonOut: string) => string
}

@Directive({
  selector: '[photoGalleryGroup]',
})
export class PhotoGalleryGroupDirective {
  @Input('photoGalleryGroup') options: GalleryOptions
  gallery: PhotoSwipe
  galleryItems: { [key: string]: GalleryItem } = {}
  galleryItemIds: Set<string> = new Set<string>()
  galleryImages: GalleryImage[] = []
  @Output() onPhotoGalleryInit = new EventEmitter()
  @Output() onPhotoGalleryDestroy = new EventEmitter()
  defaultOptions: GalleryOptions = {
    history: false,
    closeEl: true,
    captionEl: false,
    fullscreenEl: false,
    zoomEl: true,
    shareEl: false,
    counterEl: true,
    arrowEl: false,
    preloaderEl: true,
  }

  constructor(private lightboxService: LightboxService) {}

  registerGalleryItem(item: { id: string; element: HTMLElement; imageUrl: string }) {
    const image = {
      id: item.id,
      src: item.imageUrl,
      w: 0,
      h: 0,
      doGetSlideDimensions: true,
    }
    this.galleryItems[item.id] = {
      id: item.id,
      element: item.element,
      image,
    }

    this.galleryItemIds.add(item.id)
  }

  unregisterGalleryItem(id: string) {
    this.galleryItemIds.delete(id)
  }

  async openPhotoSwipe(id: string) {
    if (this.galleryItems[id].image.doGetSlideDimensions) {
      const targetImage = await loadImage(this.galleryItems[id].image.src)
      this.galleryItems[id].image.w = targetImage.naturalWidth
      this.galleryItems[id].image.h = targetImage.naturalHeight
      delete this.galleryItems[id].image.doGetSlideDimensions
    }

    this.galleryImages = [...this.galleryItemIds].map(key => this.galleryItems[key].image)
    const idx = this.galleryImages.findIndex(image => image.id === id)
    const options: GalleryOptions = Object.assign(this.defaultOptions, this.options)
    options.index = idx
    options.getThumbBoundsFn = (idx: number) => {
      const key = this.galleryImages[idx].id
      const thumbnail = this.galleryItems[key].element
      const origin = this.galleryItems[key].image
      const pageYScroll = window.pageYOffset || document.documentElement.scrollTop
      const rect = thumbnail.getBoundingClientRect()

      const thumbnailRate = rect.height / rect.width
      const originRate = origin.h / origin.w
      let x: number, y: number, w: number
      if (thumbnailRate > originRate) {
        // portrait
        y = rect.top + pageYScroll
        w = (origin.w * rect.height) / origin.h
        x = rect.left - (w - rect.width) / 2
      } else {
        // landscape
        const imageHeight = (origin.h * rect.width) / origin.w
        x = rect.left
        w = rect.width
        y = rect.top - (imageHeight - rect.height) / 2
      }

      return { x, y, w }
    }
    const photoSwipe = this.lightboxService.getLightboxElement()

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
    this.gallery.listen('destroy', () => {
      this.onPhotoGalleryDestroy.emit()
    })
    this.onPhotoGalleryInit.emit()
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
