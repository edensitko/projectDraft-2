import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EditVacationService } from 'src/app/Service/editVacation.service';
import vacations from 'src/app/model/vac';
import { HttpClient } from '@angular/common/http';
// ... other imports ...

@Component({
  selector: 'app-edit-vac',
  templateUrl: './edit-vac.component.html',
  styleUrls: ['./edit-vac.component.css']
})
export class EditVacComponent implements OnInit {
  editVacationForm: FormGroup;
  vacationId: number;
  vacationData: vacations;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private editVacationService: EditVacationService,
    private http: HttpClient
  ) {}

 
  ngOnInit(): void {
    this.vacationId = +this.route.snapshot.paramMap.get('id')!;
    this.getVacById(this.vacationId);
    // Initialize the form group here with an empty form initially (before the data is fetched)
    this.editVacationForm = this.formBuilder.group({
      id: [''],
      destination: ['', Validators.required],
      description: [''],
      start_date: [null], // Initially set to null
      end_date: [null],   // Initially set to null
      price: ['', [Validators.required, this.priceValidator]],
      image_url: [''],
    });
  }
  
  formatDate(dateString: string): string {
  // Try to parse the input date string to a valid Date object
  const dateObj = new Date(dateString);

  // Check if the parsed date object is valid
  if (!isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
    const day = ("0" + dateObj.getDate()).slice(-2);
    return `${year}.${month}.${day}`;
  }

  // Return an empty string or any other default value for invalid dates
  return '';
}


  getVacById(id: number): void {
    const apiUrl = `http://localhost:4000/api/vac/${id}`;
    this.http.get<vacations>(apiUrl).subscribe(
      (vacation: vacations) => {
        this.vacationData = vacation;
        // console.log('Fetched vacation data:', this.vacationData); // Check the fetched data
        this.populateFormWithVacationData(); // Populate the form when data is available
      },
      (error) => {
        console.error(`Error occurred while retrieving vacation with ID ${id}:`, error);
      }
    );
  }
  
  populateFormWithVacationData(): void {
    // Convert the dates to the expected format before populating the form
    const startDate = this.vacationData.start_date ? this.convertToISODate(this.vacationData.start_date) : null;
    const endDate = this.vacationData.end_date ? this.convertToISODate(this.vacationData.end_date) : null;
  
    this.editVacationForm = this.formBuilder.group({
      id: [this.vacationData.id],
      destination: [this.vacationData.destination, Validators.required],
      description: [this.vacationData.description],
      start_date: [startDate], // Use the converted date or null if it's not available
      end_date: [endDate],     // Use the converted date or null if it's not available
      price: [this.vacationData.price ? this.vacationData.price.toString() : '', [Validators.required, this.priceValidator]],
      image_url: [this.vacationData.image_url]
    });
  }
  
  convertToISODate(dateString: string): string {
    const dateParts = dateString.split('.');
    if (dateParts.length === 3) {
      const day = dateParts[0].padStart(2, '0');
      const month = dateParts[1].padStart(2, '0');
      const year = dateParts[2];
      return `${year}-${month}-${day}`;
    }
    // If the input is not in the correct format, return an empty string or any other default value
    return '';
  }
  
  
  priceValidator(control: AbstractControl): { [key: string]: any } | null {
    const price = control.value;
    if (price < 0 || price > 10000) {
      return { invalidPrice: true };
    }
    return null;
  }
  
  editVacation(): void {
    if (this.editVacationForm.invalid) {
      return;
    }
  
    const startDate = this.convertToDDMMYYYY(this.editVacationForm.value.start_date);
    const endDate = this.convertToDDMMYYYY(this.editVacationForm.value.end_date);
  
    const updatedVacationData: vacations = {
      id: this.vacationId,
      destination: this.editVacationForm.value.destination,
      description: this.editVacationForm.value.description,
      start_date: startDate,
      end_date: endDate,
      price: +this.editVacationForm.value.price,
      image_url: this.editVacationForm.value.image_url,
      isFollowed: this.vacationData.isFollowed,
      followers_count: this.vacationData.followers_count
    };
  
    this.editVacationService.updateVacation(this.vacationId, updatedVacationData).subscribe(
      (res) => {
        alert('Vacation updated');
        // console.log('Vacation updated', res);
        this.router.navigate(['/list']);
      },
      (error) => {
        console.error('Failed to update vacation', error);
      }
    );
  }
  
  convertToDDMMYYYY(dateString: string): string {
    const dateObj = new Date(dateString);
    if (!isNaN(dateObj.getTime())) {
      const day = ("0" + dateObj.getDate()).slice(-2);
      const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
      const year = dateObj.getFullYear();
      return `${day}.${month}.${year}`;
    }
    return '';
  }
  

  cancelChanges(): void {
    this.router.navigate(['/list']);
  }

  handleImagePreview(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
