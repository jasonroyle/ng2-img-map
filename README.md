# Angular 2 Image Map

Responsive image mapping interface for Angular 2.

## Markers

Markers can be placed on the image by inputting an array of x and y co-ordinates. The x and y values of a marker are percentages of the width and height of the image respectively.

```html
<img-map
  [src]="http://placekitten.com/500/300"
  [markers]="[{x: 25, y: 25}, {x: 50, y: 50}]"
></img-map>
```

A marker can be created on click if the mark event has any observers.

> Only a single marker can be created. To preserve the marker handle the mark event to push the marker to the markers array.

```ts
markers: Position[] = [];
onMark(marker: Position) {
  this.markers.push(marker);
}
```

```html
<img-map
  [src]="http://placekitten.com/500/300"
  [markers]="markers"
  (mark)="onMark($event)"
></img-map>
```

Markers can be selected if the change event has any observers.

```ts
markers: Position[] = [
  {x: 25, y: 25},
  {x: 50, y: 50},
  {x: 75, y: 75}
];
onChange(marker: Position) {
  console.log('selected', `${marker.x} x ${marker.y}`);
}
```

```html
<img-map
  [src]="http://placekitten.com/500/300"
  [markers]="markers"
  (change)="onChange($event)"
></img-map>
```

## Re-drawing

The image map will re-draw itself automatically upon window resize or property changes. If the image map requires a re-draw upon an event outside of this scope then use the `drawOnChange` property.

For example: when the user creates a marker a form is shown to the side of the image map, changing the structure of the template.

```ts
marker: Position;
name: string;
onMark(marker: Position) {
  this.marker = marker;
}
```

```html
<div
  class="col-md-4"
  *ngIf="marker"
>
  <div class="form-group">
    <input
      placeholder="Name"
      [(ngModel)]="name"
    >
  </div>
</div>
<div [ngClass]="{'col-md-8': marker, 'col-md-12': !marker}">
  <img-map
    [src]="http://placekitten.com/500/300"
    [drawOnChange]="marker"
    (mark)="onMark($event)"
  ></img-map>
</div>
```
