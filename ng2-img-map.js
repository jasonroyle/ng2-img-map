"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ImgMapComponent = (function () {
    function ImgMapComponent(renderer) {
        this.renderer = renderer;
        /**
         * On change event.
         */
        this.changeEvent = new core_1.EventEmitter();
        /**
         * On mark event.
         */
        this.markEvent = new core_1.EventEmitter();
        /**
         * Collection of markers.
         */
        this.markers = [];
        /**
         * Index of the active state marker.
         */
        this.markerActive = null;
        /**
         * Index of the hover state marker.
         */
        this.markerHover = null;
        /**
         * Radius of the markers.
         */
        this.markerRadius = 10;
        /**
         * Pixel position of markers.
         */
        this.pixels = [];
    }
    Object.defineProperty(ImgMapComponent.prototype, "setDrawOnChange", {
        set: function (changed) {
            this.draw();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImgMapComponent.prototype, "setMarkerRadius", {
        set: function (markerRadius) {
            this.markerRadius = markerRadius;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImgMapComponent.prototype, "setMarkers", {
        set: function (markers) {
            this.markerActive = null;
            this.markerHover = null;
            this.markers = markers;
            this.setPixels();
            this.draw();
        },
        enumerable: true,
        configurable: true
    });
    ImgMapComponent.prototype.change = function () {
        if (this.markerActive === null) {
            this.changeEvent.emit(null);
        }
        else {
            this.changeEvent.emit(this.markers[this.markerActive]);
        }
        this.draw();
    };
    /**
     * Get the cursor position relative to the canvas.
     */
    ImgMapComponent.prototype.cursor = function (event) {
        var rect = this.canvas.nativeElement.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };
    /**
     * Clears the canvas and draws the markers.
     */
    ImgMapComponent.prototype.draw = function () {
        var _this = this;
        var canvas = this.canvas.nativeElement;
        var container = this.container.nativeElement;
        var image = this.image.nativeElement;
        var height = image.clientHeight;
        var width = image.clientWidth;
        this.renderer.setElementAttribute(canvas, 'height', "" + height);
        this.renderer.setElementAttribute(canvas, 'width', "" + width);
        this.renderer.setElementStyle(container, 'height', height + "px");
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        this.pixels = [];
        this.markers.forEach(function (marker) {
            _this.pixels.push(_this.markerToPixel(marker));
        });
        if (this.marker) {
            this.pixel = this.markerToPixel(this.marker);
        }
        this.pixels.forEach(function (pixel, index) {
            if (_this.markerActive === index) {
                _this.drawMarker(pixel, 'active');
            }
            else if (_this.markerHover === index) {
                _this.drawMarker(pixel, 'hover');
            }
            else {
                _this.drawMarker(pixel);
            }
        });
        if (this.pixel) {
            this.drawMarker(this.pixel, 'active');
        }
    };
    /**
     * Draw a marker.
     */
    ImgMapComponent.prototype.drawMarker = function (pixel, type) {
        var context = this.canvas.nativeElement.getContext('2d');
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
    };
    /**
     * Check if a position is inside a marker.
     */
    ImgMapComponent.prototype.insideMarker = function (pixel, pos) {
        return Math.sqrt((pos.x - pixel.x) * (pos.x - pixel.x)
            + (pos.y - pixel.y) * (pos.y - pixel.y)) < this.markerRadius;
    };
    /**
     * Convert a percentage position to a pixel position.
     */
    ImgMapComponent.prototype.markerToPixel = function (marker) {
        var image = this.image.nativeElement;
        return {
            x: (image.clientWidth / 100) * marker.x,
            y: (image.clientHeight / 100) * marker.y
        };
    };
    /**
     * Convert a pixel position to a percentage position.
     */
    ImgMapComponent.prototype.pixelToMarker = function (pixel) {
        var image = this.image.nativeElement;
        return {
            x: (pixel.x / image.clientWidth) * 100,
            y: (pixel.y / image.clientHeight) * 100
        };
    };
    /**
     * Sets the new marker position.
     */
    ImgMapComponent.prototype.mark = function (pixel) {
        this.pixel = pixel;
        this.marker = this.pixelToMarker(pixel);
        this.draw();
        this.markEvent.emit(this.marker);
    };
    /**
     * Sets the marker pixel positions.
     */
    ImgMapComponent.prototype.setPixels = function () {
        var _this = this;
        this.pixels = [];
        this.markers.forEach(function (marker) {
            _this.pixels.push(_this.markerToPixel(marker));
        });
    };
    ImgMapComponent.prototype.onClick = function (event) {
        var _this = this;
        var cursor = this.cursor(event);
        if (this.markEvent.observers.length) {
            this.mark(cursor);
        }
        else if (this.changeEvent.observers.length) {
            var active = false;
            var change = false;
            this.pixels.forEach(function (pixel, index) {
                if (_this.insideMarker(pixel, cursor)) {
                    active = true;
                    if (_this.markerActive === null || _this.markerActive !== index) {
                        _this.markerActive = index;
                        change = true;
                    }
                }
            });
            if (!active && this.markerActive !== null) {
                this.markerActive = null;
                change = true;
            }
            if (change)
                this.change();
        }
    };
    ImgMapComponent.prototype.onLoad = function (event) {
        this.setPixels();
        this.draw();
    };
    ImgMapComponent.prototype.onMousemove = function (event) {
        var _this = this;
        if (this.changeEvent.observers.length) {
            var cursor_1 = this.cursor(event);
            var hover = false;
            var draw = false;
            this.pixels.forEach(function (pixel, index) {
                if (_this.insideMarker(pixel, cursor_1)) {
                    hover = true;
                    if (_this.markerHover === null || _this.markerHover !== index) {
                        _this.markerHover = index;
                        draw = true;
                    }
                }
            });
            if (!hover && this.markerHover !== null) {
                this.markerHover = null;
                draw = true;
            }
            if (draw)
                this.draw();
        }
    };
    ImgMapComponent.prototype.onMouseout = function (event) {
        if (this.markerHover) {
            this.markerHover = null;
            this.draw();
        }
    };
    ImgMapComponent.prototype.onResize = function (event) {
        this.draw();
    };
    __decorate([
        core_1.ViewChild('canvas'), 
        __metadata('design:type', core_1.ElementRef)
    ], ImgMapComponent.prototype, "canvas", void 0);
    __decorate([
        core_1.ViewChild('container'), 
        __metadata('design:type', core_1.ElementRef)
    ], ImgMapComponent.prototype, "container", void 0);
    __decorate([
        core_1.ViewChild('image'), 
        __metadata('design:type', core_1.ElementRef)
    ], ImgMapComponent.prototype, "image", void 0);
    __decorate([
        core_1.Input('drawOnChange'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], ImgMapComponent.prototype, "setDrawOnChange", null);
    __decorate([
        core_1.Input('markerRadius'), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], ImgMapComponent.prototype, "setMarkerRadius", null);
    __decorate([
        core_1.Input('markers'), 
        __metadata('design:type', Array), 
        __metadata('design:paramtypes', [Array])
    ], ImgMapComponent.prototype, "setMarkers", null);
    __decorate([
        core_1.Input('src'), 
        __metadata('design:type', String)
    ], ImgMapComponent.prototype, "src", void 0);
    __decorate([
        core_1.Output('change'), 
        __metadata('design:type', Object)
    ], ImgMapComponent.prototype, "changeEvent", void 0);
    __decorate([
        core_1.Output('mark'), 
        __metadata('design:type', Object)
    ], ImgMapComponent.prototype, "markEvent", void 0);
    ImgMapComponent = __decorate([
        core_1.Component({
            selector: 'img-map',
            styles: [
                '.img-map { position: relative; }',
                '.img-map canvas, .img-map img { position: absolute; top: 0; left: 0; }',
                '.img-map img { display: block; height: auto; max-width: 100%; }'
            ],
            template: "\n    <div\n      class=\"img-map\"\n      #container\n      (window:resize)=\"onResize($event)\"\n    >\n      <img\n        #image\n        [src]=\"src\"\n        (load)=\"onLoad($event)\"\n      >\n      <canvas\n        #canvas\n        (click)=\"onClick($event)\"\n        (mousemove)=\"onMousemove($event)\"\n        (mouseout)=\"onMouseout($event)\"\n      ></canvas>\n    </div>\n  "
        }), 
        __metadata('design:paramtypes', [core_1.Renderer])
    ], ImgMapComponent);
    return ImgMapComponent;
}());
exports.ImgMapComponent = ImgMapComponent;
//# sourceMappingURL=ng2-img-map.js.map