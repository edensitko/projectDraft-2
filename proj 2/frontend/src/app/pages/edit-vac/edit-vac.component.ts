import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EditVacationService } from 'src/app/Service/editVacation.service';
@Component({
  selector: 'app-edit-vac',
  templateUrl: './edit-vac.component.html',
  styleUrls: ['./edit-vac.component.css']
})
  export class EditVacComponent implements OnInit {
    editVacationForm: FormGroup;
    editVacationData: any;
    imagePreview: string | ArrayBuffer | null = null;



    constructor(
      private router: Router,
      private formBuilder: FormBuilder,
      private editVacationService: EditVacationService,
      private http: HttpClient,
      ) {}
    
    ngOnInit(): void {
      this.editVacationForm = this.formBuilder.group({
        id:[''],
        destination: [''],
        description: [''],
        start_date: [''],
        end_date: [''],
        price: ['', [Validators.required, this.priceValidator]],
        image_url: [''],
      });
    }
    priceValidator(control: AbstractControl): { [key: string]: any } | null {
      const price = control.value;
      if (price < 0 || price > 10000) {
        return { invalidPrice: true };
      }
      return null;
    }
    private formatDate(date: string): string {
      const parts = date.split('-'); 
      const formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`; 
      return formattedDate;
    }

  editVacation(): void {
    if (this.editVacationForm.invalid) {
      return;
    }

    this.editVacationData = {
      id: this.editVacationForm.value.id,
      destination: this.editVacationForm.value.destination,
      description: this.editVacationForm.value.description,
      start_date: this.formatDate(this.editVacationForm.value.start_date), 
      end_date: this.formatDate(this.editVacationForm.value.end_date), 
      price: this.editVacationForm.value.price,
      image_url: this.editVacationForm.value.image_url,
    };

    console.log(this.editVacationData);

    this.editVacationService.editVacation(this.editVacationData).subscribe(
      (res) => {
        alert('Vacation updated ');
        console.log('Vacation updated ');
        this.router.navigate(['/list']);
        
      },
      (error) => {
        console.error('Failed to update vacation', error);
      }
    );
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

  
