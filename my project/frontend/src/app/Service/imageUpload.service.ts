import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private http: HttpClient) { }

  getImages(imageNames: string[]): Observable<string[]> {
    const imageObservables = imageNames.map(imageName => {
      const imageUrl = `assets/images/${imageName}`;
      return this.http.get(imageUrl, { responseType: 'blob' });
    });

    return forkJoin(imageObservables).pipe(
      map((imageBlobs: Blob[]) => {
        const imageUrls: string[] = [];
        for (const imageBlob of imageBlobs) {
          const reader = new FileReader();
          reader.onloadend = () => {
            imageUrls.push(reader.result as string);
          };
          reader.readAsDataURL(imageBlob);
        }
        return imageUrls;
      })
    );
  }
}