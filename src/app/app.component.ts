import { Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { PolygonCoordinate } from './types/CanvasTypes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web_customer_app';
  selectedFile = null;

  isDrawing: boolean = false;

  // canvas
  @ViewChild('productCanvas') productCanvas: ElementRef;
  productCanvasContext: CanvasRenderingContext2D | null;
  
  @ViewChild('backgroundCanvas') backgroundCanvas: ElementRef;
  backgroundCanvasContext: CanvasRenderingContext2D | null;
  productPolygonCoordinates: Array<PolygonCoordinate>;
  logoPolygonCoordinates: Array<PolygonCoordinate>;

  // file inputs
  @ViewChild('productFileInput') productFileInput: ElementRef;
  @ViewChild('backgroundFileInput') backgroundFileInput: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    // start canvas drawing contexts
    if (!!this.productCanvas.nativeElement.getContext && !!this.backgroundCanvas.nativeElement.getContext) {
      this.prepareCanvasAreas()
    } else {
      console.log('Canvas drawing is not supported');
    }
  }

  /**
   * Prepare the canvas areas
   */
  private prepareCanvasAreas() {
    this.prepareProductCanvas()
    this.prepareBackgroundCanvas()
  }

  private prepareProductCanvas() {
    this.productCanvasContext = this.productCanvas.nativeElement.getContext("2d");
  }

  private prepareBackgroundCanvas() {
    this.backgroundCanvasContext = this.backgroundCanvas.nativeElement.getContext("2d");
  }

  erase(canvasType:string, pathCoordinates: [{x:number, y:number}]) {
    let canvasContext = (canvasType == 'product') ? this.productCanvasContext : this.backgroundCanvasContext;
    canvasContext!.globalCompositeOperation = 'destination-out';
    canvasContext!.beginPath();
    for(let i = 0; i < pathCoordinates.length; i++) {
      let coord = pathCoordinates[i]
      if(i == 0) {
        canvasContext!.moveTo(coord.x, coord.y);    
      }  else {
        canvasContext!.lineTo(coord.x, coord.y);    
      }
    }
    canvasContext!.closePath();
    canvasContext!.fill();
    canvasContext!.globalCompositeOperation = 'source-over';
  }

  ////////////////////////////////////////////////////////////////////////////
  // LOGO POLYGON
  ////////////////////////////////////////////////////////////////////////////
  resetLogoPolygon() {
    this.logoPolygonCoordinates = [];
  }

  toggleIsDrawingPolygon() {
    this.isDrawing = !this.isDrawing;
  }

  addProductPolygonCoordinates(x:number, y:number) {

  }

  addLogoPolygonCoordinates(x:number, y:number) {
    if(this.logoPolygonCoordinates.length > 0 && this.logoPolygonCoordinates[0].x == x && this.logoPolygonCoordinates[0].y == y) {
      console.log("close polygon");
      console.log("erase!");
    }
    this.logoPolygonCoordinates.push({x: x, y: y})
  }

  mouseClickedOnDrawing(event:any) {
    // posicao relativa
    // adicionar a coods polygon
    // representar stroke em canvas
  }

  /**
   * Adds behaviour to the selected image.
   * This method is shared across multiple file select inputs.
   * 
   * @param canvasType the type of canvas to be updated with the newly selected image
   * @param event the event itself
   */
  onFileSelected(canvasType: string, event: any) {
    let file = event.target.files[0];
    const reader = new FileReader();

    let isProduct: boolean = (canvasType == 'product');
    
    let canvas = isProduct ? this.productCanvas : this.backgroundCanvas;
    let canvasContext = isProduct ? this.productCanvasContext : this.backgroundCanvasContext;

    reader.onload = e => {
      let img = new Image;
      img.onload = function(){
        canvasContext?.drawImage(img, 0, 0, img.width,    img.height,     // source rectangle
                   0, 0, canvas.nativeElement.width, canvas.nativeElement.height);
      };
      img.src = URL.createObjectURL(file);
      
    }
    reader.readAsDataURL(file);
  }



}
