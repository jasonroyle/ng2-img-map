# Angular 2 Image Map

Responsive image mapping interface for Angular 2.

[Demo](https://plnkr.co/edit/Xwn1Z8HLDgQRwWwdXfoT?p=preview)

## Markers

Markers can be placed on the image by inputting an array of co-ordinates. The co-ordinate values of a marker represent percentages of the dimensions of the image.

```html
<img-map
  src="http://placekitten.com/g/500/300"
  [markers]="[[25, 25], [50, 50], [75, 75]]"
></img-map>
```

Markers can be created if the mark event has any observers.

> New markers are pushed to the markers array.

```ts
markers: number[][] = [];
onMark(marker: number[]) {
  console.log('Marker', marker);
  console.log('Markers', this.makers);
}
```

```html
<img-map
  src="http://placekitten.com/g/500/300"
  [markers]="markers"
  (mark)="onMark($event)"
></img-map>
```

Markers can be selected if the change event has any observers.

```ts
markers: number[][] = [[25, 25], [50, 50], [75, 75]];
onChange(marker: number[]) {
  console.log('Marker', marker);
}
```

```html
<img-map
  src="http://placekitten.com/g/500/300"
  [markers]="markers"
  (change)="onChange($event)"
></img-map>
```

## Drawing

The image map will draw automatically upon window resize or property changes. If the image map requires a draw upon an event outside of this scope then call the `draw` function of the image map component.

```ts
@ViewChild('imgMap')
imgMap: ImgMapComponent;
markers: number[][] = [];
ngOnInit() {
  window.setTimeout(() => {
    this.markers.push([25, 25], [50, 50], [75, 75]);
    console.log('Markers', this.markers);
    window.setTimeout(() => this.imgMap.draw(), 1000);
  }, 1000);
}
```

```html
<img-map
  #imgMap
  src="http://placekitten.com/g/500/300"
  [markers]="markers"
></img-map>
```
