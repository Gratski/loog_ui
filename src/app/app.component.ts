import { Component, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { PolygonCoordinate } from './types/CanvasTypes';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';


interface CodeAnalisys {
  result: String
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web_customer_app';
  selectedFile = null;

  public isLoading: Boolean;

  public codeSnippet: String;
  public intention: String;
  public analysis: String;

  public convertToOtherLanguage: Boolean = false;
  public targetLanguage: String;

  // source images

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

  constructor(private renderer: Renderer2, private http: HttpClient) {}

  ngAfterViewInit() {
    // start canvas drawing contexts
    if (!!this.productCanvas.nativeElement.getContext && !!this.backgroundCanvas.nativeElement.getContext) {
      this.prepareCanvasAreas()
    } else {
      console.log('Canvas drawing is not supported');
    }
  }

  public intentionChanged() {
    console.log('converting')
    
  }

  public submitCode() {
    console.log('test')
    this.isLoading = true
    this.http.post<CodeAnalisys>('/api/code/analysis2', {
      model: "gpt-3.5-turbo",
      messages: [
        {role: "user", content: "I am a software engineer. And I want to change the following code for better performance while using the minimum amount of CPU and memory."},
        {role: "user", content: this.codeSnippet},
        {role: "user", content: this.intention == 'convert' ? this.targetLanguage : this.intention}
      ]
    }).subscribe((data: CodeAnalisys) => {
      this.isLoading = false
      this.analysis = data.result;
    })
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

  addLogoPolygonCoordinates(x:number, y:number) {
    if(this.logoPolygonCoordinates.length > 0 && this.logoPolygonCoordinates[0].x == x && this.logoPolygonCoordinates[0].y == y) {
      console.log("close polygon");
      console.log("erase!");
    }
    this.logoPolygonCoordinates.push({x: x, y: y})
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
        canvasContext?.drawImage(img, 0, 0, img.width,    img.height,
                   0, 0, canvas.nativeElement.width, canvas.nativeElement.height);
      };
      img.src = URL.createObjectURL(file);
      
    }
    reader.readAsDataURL(file);
  }



}
