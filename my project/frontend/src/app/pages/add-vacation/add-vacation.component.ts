import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-vacation',
  templateUrl: './add-vacation.component.html',
  styleUrls: ['./add-vacation.component.css']
})
export class AddVacationComponent implements OnInit {
  newVacationForm: FormGroup;
  newVacationData: any;
  imagePreview: string | ArrayBuffer | null = null;
  uploadedImageFiles: File[] = []; // Array to store the uploaded image files


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {}

  private formatDate(date: string): string {
    const parts = date.split('-');
    const formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
    return formattedDate;
  }

  ngOnInit(): void {
    this.newVacationForm = this.formBuilder.group({
      destination: ['', Validators.required],
      description: ['', Validators.required],
      start_date: ['', [Validators.required, this.futureDateValidator]], // Use custom validator for future dates
      end_date: ['', [Validators.required, this.futureDateValidator]], // Use custom validator for future dates
      price: ['', [Validators.required, this.priceValidator]],
      image_url: [''],
      imageFile: [null] // Initialize with null, not "null" string

    });
  }

  priceValidator(control: AbstractControl): { [key: string]: any } | null {
    const price = control.value;
    if (price < 0 || price > 10000) {
      return { invalidPrice: true };
    }
    return null;
  }

  imageUrlValidator(control: FormControl): { [key: string]: any } | null {
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;

    if (control.value && !urlPattern.test(control.value)) {
      return { invalidUrl: true };
    }

    return null;
  }

  futureDateValidator(control: FormControl): { [key: string]: any } | null {
    const selectedDate = new Date(control.value);
    const currentDate = new Date();
  
    if (selectedDate < currentDate) {
      return { pastDate: true, message: 'Please select a future date.' };
    }
  
    return null;
  }
  

  addVacation(): void {
    if (this.newVacationForm.invalid) {
      return;
    }
  
    // Create a new FormData object to include both form data and the image file
    const formData = new FormData();
    formData.append('destination', this.newVacationForm.value.destination);
    formData.append('description', this.newVacationForm.value.description);
    formData.append('start_date', this.formatDate(this.newVacationForm.value.start_date));
    formData.append('end_date', this.formatDate(this.newVacationForm.value.end_date));
    formData.append('price', this.newVacationForm.value.price);
  
    // Get the image file from the form control and append it to the FormData
    const imageFileControl = this.newVacationForm.get('imageFile');
    if (imageFileControl && imageFileControl.value) {
      const imageFile = imageFileControl.value;
      formData.append('image_url', this.newVacationForm.value.image_url);
    }
  
    console.log('Form Data with Image:', formData);
  
    // Send the formData to the server using HTTP POST
    this.http.post('http://localhost:4000/api/vac/addVac', formData).subscribe(
      (res) => {
        alert('Vacation added successfully');
        console.log('Vacation added successfully');
        console.log(res);
        this.router.navigate(['/list']);
      },
      (error) => {
        console.error('Failed to add vacation', error);
      }
    );
  }
  
  handleImagePreview(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedImageFiles.push(file); // Push the uploaded image to the array
      console.log('Uploaded Image:', file.name); // Log the file name to the console

      // Read the image data as a Base64 URL using FileReader
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
