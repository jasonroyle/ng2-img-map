import { EventEmitter, Renderer } from '@angular/core';
export interface Position {
    x: number;
    y: number;
}
export declare class ImgMapComponent {
    private renderer;
    /**
     * Canvas element.
     */
    private canvas;
    /**
     * Container element.
     */
    private container;
    /**
     * Image element.
     */
    private image;
    setDrawOnChange: any;
    setMarkerRadius: number;
    setMarkers: Position[];
    /**
     * Image source URL.
     */
    src: string;
    /**
     * On change event.
     */
    changeEvent: EventEmitter<Position>;
    /**
     * On mark event.
     */
    markEvent: EventEmitter<Position>;
    /**
     * New marker.
     */
    private marker;
    /**
     * Collection of markers.
     */
    private markers;
    /**
     * Index of the active state marker.
     */
    private markerActive;
    /**
     * Index of the hover state marker.
     */
    private markerHover;
    /**
     * Radius of the markers.
     */
    private markerRadius;
    /**
     * Pixel position of the new marker.
     */
    private pixel;
    /**
     * Pixel position of markers.
     */
    private pixels;
    constructor(renderer: Renderer);
    private change();
    /**
     * Get the cursor position relative to the canvas.
     */
    private cursor(event);
    /**
     * Clears the canvas and draws the markers.
     */
    private draw();
    /**
     * Draw a marker.
     */
    private drawMarker(pixel, type?);
    /**
     * Check if a position is inside a marker.
     */
    private insideMarker(pixel, pos);
    /**
     * Convert a percentage position to a pixel position.
     */
    private markerToPixel(marker);
    /**
     * Convert a pixel position to a percentage position.
     */
    private pixelToMarker(pixel);
    /**
     * Sets the new marker position.
     */
    private mark(pixel);
    /**
     * Sets the marker pixel positions.
     */
    private setPixels();
    onClick(event: MouseEvent): void;
    onLoad(event: UIEvent): void;
    onMousemove(event: MouseEvent): void;
    onMouseout(event: MouseEvent): void;
    onResize(event: UIEvent): void;
}
