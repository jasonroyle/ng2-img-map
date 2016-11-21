import {
  Component, ElementRef, EventEmitter, Input, Output, Renderer, ViewChild
} from '@angular/core';

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

  @Input('markers')
  set setMarkers(markers: number[][]) {
    this.markerActive = null;
    this.markerHover = null;
    this.markers = markers;
    this.draw();
  }

  /**
   * Radius of the markers.
   */
  @Input()
  markerRadius: number = 10;

  /**
   * Image source URL.
   */
  @Input()
  src: string;

  /**
   * On change event.
   */
  @Output('change')
  changeEvent = new EventEmitter<number[]>();

  /**
   * On mark event.
   */
  @Output('mark')
  markEvent = new EventEmitter<number[]>();

  /**
   * Collection of markers.
   */
  private markers: number[][] = [];

  /**
   * Index of the hover state marker.
   */
  private markerHover: number = null;

  /**
   * Pixel position of markers.
   */
  private pixels: number[][] = [];

  /**
   * Index of the active state marker.
   */
  markerActive: number;

  constructor(private renderer: Renderer) {}

  private change(): void {
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
  private cursor(event: MouseEvent): number[] {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    return [
      event.clientX - rect.left,
      event.clientY - rect.top
    ];
  }

  /**
   * Draw a marker.
   */
  private drawMarker(pixel: number[], type?: string): void {
    const context = this.canvas.nativeElement.getContext('2d');
    context.beginPath();
    context.arc(pixel[0], pixel[1], this.markerRadius, 0, 2 * Math.PI);
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
  private insideMarker(pixel: number[], coordinate: number[]): boolean {
    return Math.sqrt(
      (coordinate[0] - pixel[0]) * (coordinate[0] - pixel[0])
      + (coordinate[1] - pixel[1]) * (coordinate[1] - pixel[1])
    ) < this.markerRadius;
  }

  /**
   * Convert a percentage position to a pixel position.
   */
  private markerToPixel(marker: number[]): number[] {
    const image: HTMLImageElement = this.image.nativeElement;
    return [
      (image.clientWidth / 100) * marker[0],
      (image.clientHeight / 100) * marker[1]
    ];
  }

  /**
   * Convert a pixel position to a percentage position.
   */
  private pixelToMarker(pixel: number[]): number[] {
    const image: HTMLImageElement = this.image.nativeElement;
    return [
      (pixel[0] / image.clientWidth) * 100,
      (pixel[1] / image.clientHeight) * 100
    ];
  }

  /**
   * Sets the new marker position.
   */
  private mark(pixel: number[]): void {
    this.markerActive = this.markers.length;
    this.markers.push(this.pixelToMarker(pixel));
    this.draw();
    this.markEvent.emit(this.markers[this.markerActive]);
  }

  /**
   * Sets the marker pixel positions.
   */
  private setPixels(): void {
    this.pixels = [];
    this.markers.forEach(marker => {
      this.pixels.push(this.markerToPixel(marker));
    });
  }

  /**
   * Clears the canvas and draws the markers.
   */
  draw(): void {
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
    this.setPixels();
    this.pixels.forEach((pixel, index) => {
      if (this.markerActive === index) {
        this.drawMarker(pixel, 'active');
      } else if (this.markerHover === index) {
        this.drawMarker(pixel, 'hover');
      } else {
        this.drawMarker(pixel);
      }
    });
  }

  onClick(event: MouseEvent): void {
    const cursor = this.cursor(event);
    var active = false;
    if (this.changeEvent.observers.length) {
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
    if (!active && this.markEvent.observers.length) {
      this.mark(cursor);
    }
  }

  onLoad(event: UIEvent): void {
    this.draw();
  }

  onMousemove(event: MouseEvent): void {
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

  onMouseout(event: MouseEvent): void {
    if (this.markerHover) {
      this.markerHover = null;
      this.draw();
    }
  }

  onResize(event: UIEvent): void {
    this.draw();
  }

}
