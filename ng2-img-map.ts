import {
  Component, ElementRef, EventEmitter, Input, Output, Renderer, ViewChild
} from '@angular/core';

export interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'img-map',
  styles: [
    '.img-map { position: relative; }',
    '.img-map canvas, .img-map img { position: absolute; top: 0; left: 0; }',
    '.img-map img { display: block; height: auto; max-width: 100%; }'
  ],
  template: `
    <div
      class="img-map"
      #container
      (window:resize)="onResize($event)"
    >
      <img
        #image
        [src]="src"
        (load)="onLoad($event)"
      >
      <canvas
        #canvas
        (click)="onClick($event)"
        (mousemove)="onMousemove($event)"
        (mouseout)="onMouseout($event)"
      ></canvas>
    </div>
  `
})
export class ImgMapComponent {

  /**
   * Canvas element.
   */
  @ViewChild('canvas')
  private canvas: ElementRef;

  /**
   * Container element.
   */
  @ViewChild('container')
  private container: ElementRef;

  /**
   * Image element.
   */
  @ViewChild('image')
  private image: ElementRef;

  @Input('drawOnChange')
  public set setDrawOnChange(changed) {
    this.draw();
  }

  @Input('markerRadius')
  public set setMarkerRadius(markerRadius: number) {
    this.markerRadius = markerRadius;
  }

  @Input('markers')
  public set setMarkers(markers: Position[]) {
    this.markerActive = null;
    this.markerHover = null;
    this.markers = markers;
    this.setPixels();
    this.draw();
  }

  /**
   * Image source URL.
   */
  @Input('src')
  public src: string;

  /**
   * On change event.
   */
  @Output('change')
  public changeEvent = new EventEmitter<Position>();

  /**
   * On mark event.
   */
  @Output('mark')
  public markEvent = new EventEmitter<Position>();

  /**
   * New marker.
   */
  private marker: Position;

  /**
   * Collection of markers.
   */
  private markers: Position[] = [];

  /**
   * Index of the active state marker.
   */
  private markerActive: number = null;

  /**
   * Index of the hover state marker.
   */
  private markerHover: number = null;

  /**
   * Radius of the markers.
   */
  private markerRadius = 10;

  /**
   * Pixel position of the new marker.
   */
  private pixel: Position;

  /**
   * Pixel position of markers.
   */
  private pixels: Position[] = [];

  public constructor(private renderer: Renderer) {}

  private change() {
    if (this.markerActive === null) {
      this.changeEvent.emit(null);
    } else {
      this.changeEvent.emit(this.markers[this.markerActive]);
    }
    this.draw();
  }

  /**
   * Get the cursor position relative to the canvas.
   */
  private cursor(event: MouseEvent): Position {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * Clears the canvas and draws the markers.
   */
  private draw() {
    window.setTimeout(() => {
      const canvas: HTMLCanvasElement = this.canvas.nativeElement;
      const container: HTMLDivElement = this.container.nativeElement;
      const image: HTMLImageElement = this.image.nativeElement;
      const height = image.clientHeight;
      const width = image.clientWidth;
      this.renderer.setElementAttribute(canvas, 'height', `${height}`);
      this.renderer.setElementAttribute(canvas, 'width', `${width}`);
      this.renderer.setElementStyle(container, 'height', `${height}px`);
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, width, height);
      this.pixels = [];
      this.markers.forEach(marker => {
        this.pixels.push(this.markerToPixel(marker));
      });
      if (this.marker) {
        this.pixel = this.markerToPixel(this.marker);
      }
      this.pixels.forEach((pixel, index) => {
        if (this.markerActive === index) {
          this.drawMarker(pixel, 'active');
        } else if (this.markerHover === index) {
          this.drawMarker(pixel, 'hover');
        } else {
          this.drawMarker(pixel);
        }
      });
      if (this.pixel) {
        this.drawMarker(this.pixel, 'active');
      }
    }, 1);
  }

  /**
   * Draw a marker.
   */
  private drawMarker(pixel: Position, type?: string) {
    const context = this.canvas.nativeElement.getContext('2d');
    context.beginPath();
    context.arc(pixel.x, pixel.y, this.markerRadius, 0, 2 * Math.PI);
    switch (type) {
      case 'active':
        context.fillStyle = 'rgba(255, 0, 0, 0.6)';
        break;
      case 'hover':
        context.fillStyle = 'rgba(0, 0, 255, 0.6)';
        break;
      default:
        context.fillStyle = 'rgba(0, 0, 255, 0.4)';
    }
    context.fill();
  }

  /**
   * Check if a position is inside a marker.
   */
  private insideMarker(pixel: Position, pos: Position) {
    return Math.sqrt(
      (pos.x - pixel.x) * (pos.x - pixel.x)
      + (pos.y - pixel.y) * (pos.y - pixel.y)
    ) < this.markerRadius;
  }

  /**
   * Convert a percentage position to a pixel position.
   */
  private markerToPixel(marker: Position): Position {
    const image: HTMLImageElement = this.image.nativeElement;
    return {
      x: (image.clientWidth / 100) * marker.x,
      y: (image.clientHeight / 100) * marker.y
    };
  }

  /**
   * Convert a pixel position to a percentage position.
   */
  private pixelToMarker(pixel: Position) {
    const image: HTMLImageElement = this.image.nativeElement;
    return {
      x: (pixel.x / image.clientWidth) * 100,
      y: (pixel.y / image.clientHeight) * 100
    };
  }

  /**
   * Sets the new marker position.
   */
  private mark(pixel: Position) {
    this.pixel = pixel;
    this.marker = this.pixelToMarker(pixel);
    this.draw();
    this.markEvent.emit(this.marker);
  }

  /**
   * Sets the marker pixel positions.
   */
  private setPixels() {
    this.pixels = [];
    this.markers.forEach(marker => {
      this.pixels.push(this.markerToPixel(marker));
    });
  }

  public onClick(event: MouseEvent) {
    const cursor = this.cursor(event);
    if (this.markEvent.observers.length) {
      this.mark(cursor);
    } else if (this.changeEvent.observers.length) {
      var active = false;
      var change = false;
      this.pixels.forEach((pixel, index) => {
        if (this.insideMarker(pixel, cursor)) {
          active = true;
          if (this.markerActive === null || this.markerActive !== index) {
            this.markerActive = index;
            change = true;
          }
        }
      });
      if (!active && this.markerActive !== null) {
        this.markerActive = null;
        change = true;
      }
      if (change) this.change();
    }
  }

  public onLoad(event: UIEvent) {
    this.setPixels();
    this.draw();
  }

  public onMousemove(event: MouseEvent) {
    if (this.changeEvent.observers.length) {
      const cursor = this.cursor(event);
      var hover = false;
      var draw = false;
      this.pixels.forEach((pixel, index) => {
        if (this.insideMarker(pixel, cursor)) {
          hover = true;
          if (this.markerHover === null || this.markerHover !== index) {
            this.markerHover = index;
            draw = true;
          }
        }
      });
      if (!hover && this.markerHover !== null) {
        this.markerHover = null;
        draw = true;
      }
      if (draw) this.draw();
    }
  }

  public onMouseout(event: MouseEvent) {
    if (this.markerHover) {
      this.markerHover = null;
      this.draw();
    }
  }

  public onResize(event: UIEvent) {
    this.draw();
  }

}
