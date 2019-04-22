import { Injectable, ComponentFactoryResolver, ApplicationRef, ComponentRef, ElementRef, Injector } from '@angular/core'
import { LightboxComponent } from './lightbox.component'

@Injectable()
export class LightboxService {
  private lightbox: ComponentRef<LightboxComponent>
  private photoSwipe: ElementRef

  constructor(
    private applicationRef: ApplicationRef,
    private injector: Injector,
    private resolver: ComponentFactoryResolver
  ) {
    this.lightbox = this.resolver.resolveComponentFactory(LightboxComponent).create(this.injector)
    this.photoSwipe = this.lightbox.instance.element
    this.applicationRef.attachView(this.lightbox.hostView)
    document.body.appendChild(this.lightbox.location.nativeElement)
  }

  getLightboxElement(): HTMLElement {
    return this.photoSwipe.nativeElement
  }
}
