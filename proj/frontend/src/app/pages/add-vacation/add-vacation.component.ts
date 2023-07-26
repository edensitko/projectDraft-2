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
      image_url: ['', [Validators.required, this.imageUrlValidator]],
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

    this.newVacationData = {
      destination: this.newVacationForm.value.destination,
      description: this.newVacationForm.value.description,
      start_date: this.formatDate(this.newVacationForm.value.start_date),
      end_date: this.formatDate(this.newVacationForm.value.end_date),
      price: this.newVacationForm.value.price,
      image_url: this.newVacationForm.value.image_url,
    };

    console.log(this.newVacationData);

    this.http.post('http://localhost:4000/api/vac/addVac', this.newVacationData).subscribe(
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
}
