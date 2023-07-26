
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import vacations from 'src/app/model/vac';
import { FollowersService } from 'src/app/Service/followers.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  allVacData: vacations[];
  followedItems: number[] = [];
  role: string;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  displayedVacData: vacations[] = [];
  defaultHeartColor: string = 'grey';
  showFollowingVacations: boolean = false;
  showUpcomingVacations: boolean = false;
  showFiltered: boolean = false;
  activeButton: string = ''; // Add this property and initialize it to an empty string
  showActiveVacations: boolean;
  clickedButtons: string[] = [];
  displayedVacations: any[] = []; // Will hold the filtered vacations


  constructor(
    private http: HttpClient,
    private router: Router,
    private followersService: FollowersService
  ) {
    this.displayedVacData = []; 
    this.allVacData = [];

  }
  ngOnInit(): void {
    this.getAllVacData();
    const storedItems = localStorage.getItem('followedItems');
    if (storedItems) {
      this.followedItems = JSON.parse(storedItems);
    }
    this.fetchFollowedVacations();
    this.showFollowingVacations = this.followedItems.length === 0;
    this.showFollowingVacations = false;
    this.showUpcomingVacations = false;
    this.showActiveVacations = false;
  }
  
  fetchFollowedVacations(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.role = JSON.parse(userData).role;
      const userId = JSON.parse(userData).id;
      const url = `http://localhost:4000/api/following/${userId}`;
      this.http.get<any[]>(url).subscribe(
        (data: any[]) => {
          const newFollowedItems = data.map(item => item.vacation_id); // Assuming the follower data contains the vacation IDs as "vacation_id"
          localStorage.setItem('followedItems', JSON.stringify(newFollowedItems)); // Save the followerData in localStorage
  
          const user = JSON.parse(userData);
          user.followedItems = newFollowedItems; // Set the new array in the userData
          localStorage.setItem('userData', JSON.stringify(user)); // Update the userData in localStorage
  
          this.followedItems = newFollowedItems; // Update the component's followedItems array
          console.log('Data from FOLLOWING:', this.followedItems);
          this.getAllVacData(); 
          // Call this function after fetching the follower data

        },
        (error) => {
          console.error('Error occurred while fetching FOLLOWING data:', error);
          this.getAllVacData(); // Call this function even if there's an error in fetching follower data
        }
      );
    } else {
      this.getAllVacData();
       // Call this function if there is no userData
    }
  }
  filterFollowedItems(): void {
    this.activeButton = 'showAll';
    this.showFollowingVacations = !this.showFollowingVacations;

    if (this.showFollowingVacations) {
      this.clickedButtons.push('Following Vacations');
      // Fetch followed vacations data when the "Following Vacations" button is clicked
      this.fetchFollowedVacations();
    } else {
      this.clickedButtons = this.clickedButtons.filter(name => name !== 'Following Vacations');
      // Revert to the default displayed data when other filters are clicked
      this.updateDisplayedVacData();
    }

    // Disable other buttons when one is clicked
    this.showUpcomingVacations = false;
    this.showActiveVacations = false;
  }

  
  filterUpcomingVacations(): void {
    this.activeButton = 'showUpcoming';
    this.showUpcomingVacations = !this.showUpcomingVacations;
  
    // Add the name of the clicked button to the clickedButtons array
    if (this.showUpcomingVacations) {
      this.clickedButtons.push('Show Upcoming Vacations');
      this.showFollowingVacations = false; // Disable other buttons when one is clicked
      this.showActiveVacations = false;
  
      // Apply the filtering logic
      this.updateDisplayedVacData();
    } else {
      // Remove the name from the clickedButtons array if the button is unclicked
      this.clickedButtons = this.clickedButtons.filter(name => name !== 'Show Upcoming Vacations');
    }
  }
  filterActiveVacations(): void {
    this.activeButton = 'showActive';
    this.showActiveVacations = !this.showActiveVacations;
  
    // Add the name of the clicked button to the clickedButtons array
    if (this.showActiveVacations) {
      this.clickedButtons.push('Show Active Vacations');
      this.showFollowingVacations = false; // Disable other buttons when one is clicked
      this.showUpcomingVacations = false;
  
      // Apply the filtering logic
      this.updateDisplayedVacData();
    } else {
      // Remove the name from the clickedButtons array if the button is unclicked
      this.clickedButtons = this.clickedButtons.filter(name => name !== 'Show Active Vacations');
    }
  }

  isVacationActive(vacation: vacations): boolean {
    const currentDate = new Date().getTime();
    const [day, month, year] = vacation.start_date.split('.');
    const startDate = new Date(Number(year), Number(month) - 1, Number(day)).getTime();

    const [endDay, endMonth, endYear] = vacation.end_date.split('.');
    const endDate = new Date(Number(endYear), Number(endMonth) - 1, Number(endDay)).getTime();

    return startDate <= currentDate && endDate >= currentDate;
  }
  getCurrentActiveVacations(): vacations[] {
    const currentDate = new Date().getTime();
    return this.allVacData.filter(vacation => this.isVacationActive(vacation));
  }
  

  getUpcomingVacations(): vacations[] {
    const currentDate = new Date().getTime();
    return this.allVacData.filter((vacation) => {
      const [day, month, year] = vacation.start_date.split('.');
      const startDate = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
      return startDate > currentDate;
    });
  }
  
  getAllVacData(): void {
    const apiUrl = 'http://localhost:4000/api/vac/getAllVac';
    this.http.get<any[]>(apiUrl).subscribe(
      (data: any[]) => {
        this.allVacData = data;
  
        this.allVacData.sort((a, b) => {
          return this.compareDates(a.start_date, b.start_date);
        });
  
        this.totalItems = this.allVacData.length;
        this.updateDisplayedVacData();
      },
      (error) => {
        console.error('Error occurred while fetching data:', error);
      }
    );
  }
  
  compareDates(date1: string, date2: string): number {
    const [day1, month1, year1] = date1.split('.');
    const [day2, month2, year2] = date2.split('.');
    
    const dateObj1 = new Date(Number(year1), Number(month1) - 1, Number(day1));
    const dateObj2 = new Date(Number(year2), Number(month2) - 1, Number(day2));
  
    if (dateObj1.getTime() < dateObj2.getTime()) {
      return -1;
    } else if (dateObj1.getTime() > dateObj2.getTime()) {
      return 1;
    } else {
      return 0;
    }
  }
  

  updateDisplayedVacData(): void {
    let filteredData: vacations[] = this.allVacData;
  
    if (this.showFollowingVacations) {
      // Filter vacations that are being followed by the user
      filteredData = filteredData.filter(vacation => this.followedItems.includes(vacation.id));
    } else {
      // Apply other filters when showFollowingVacations is false
      if (this.showUpcomingVacations) {
        const currentDate = new Date().getTime();
        filteredData = filteredData.filter(vacation => {
          const [day, month, year] = vacation.start_date.split('.');
          const startDate = new Date(Number(year), Number(month) - 1, Number(day)).getTime();
          return startDate > currentDate;
        });
      } else if (this.showActiveVacations) {
        filteredData = filteredData.filter(vacation => this.isVacationActive(vacation));
      }

    }
  
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedVacData = filteredData.slice(startIndex, endIndex);
    
  }
  
  onPageChange(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.updateDisplayedVacData();

  }

  getPaginationRange(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

 

  followItem(itemId: number): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      const followedItems = user.followedItems || [];
      const isFollowed = followedItems.includes(itemId);

      if (isFollowed) {
        user.followedItems = followedItems.filter((item: any) => item !== itemId);
        this.followersService.deleteFollow(user.id, itemId).subscribe(
          () => {
            console.log(`Unfollowed vacation with ID ${itemId}`);
            this.updateDisplayedVacData(); // Update displayedVacData after unfollowing an item

          },
          (error) => {
            console.error(`Error unfollowing vacation ${itemId}:`, error);
          }
        );
      } else {
        user.followedItems = [...followedItems, itemId];
        this.followersService.addFollow(user.id, itemId).subscribe(
          () => {
            console.log(`Followed vacation with ID ${itemId}`);
            this.updateDisplayedVacData();
          },
          (error) => {
            console.error(`Error following vacation ${itemId}:`, error);
          }
        );
      }
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }
updateFollow(): void {
  const url = `http://localhost:4000/api/updatefollow`;
  const body = "updated";

  this.http.put(url, body).subscribe(
    () => {
      console.log("Follow update successful");
      this.getAllVacData(); 
    },
    (error) => {
      console.error("Error updating follow:", error);
    }
  );
}

getHeartIconColor(item: any): string {
  const userData = localStorage.getItem('userData');
  if (userData) {
    const user = JSON.parse(userData);
    const followedItems = user.followedItems || [];
    const isFollowed = followedItems.includes(item.id);
    return isFollowed ? 'red' : this.defaultHeartColor;
  } else {
    return this.defaultHeartColor;
  }
}

  removeVac(id: number): void {
    const confirmDelete = window.confirm('Are you sure you want to delete this vacation?');
    if (confirmDelete) {
      const apiUrl = `http://localhost:4000/api/vac/deleteVac/${id}`;
      this.http.delete(apiUrl).subscribe(
        () => {
          console.log(`Vacation with ID ${id} removed successfully.`);
          this.allVacData = this.allVacData.filter((item) => item.id !== id);
          this.followersService.deleteFollow(id, id).subscribe(
            () => {
              console.log(`Unfollowed vacation with ID ${id}`);
              this.updateDisplayedVacData(); 
              this.router.navigate(['/list']);
            },
            (error) => {
              console.error(`Error occurred while unfollowing vacation with ID ${id}:`, error);
            }
          );
        },
        (error) => {
          console.error(`Error occurred while deleting vacation with ID ${id}:`, error);
        }
      );
    }
  }

  getVacById(id: number): void {
    const apiUrl = `http://localhost:4000/api/vac/${id}`;
    this.http.get(apiUrl).subscribe(
      (vacation) => {
        console.log(`Vacation with ID ${id}:`, vacation);
      },
      (error) => {
        console.error(`Error occurred while retrieving vacation with ID ${id}:`, error);
      }
    );
  }

  editVacation(id: number): void {
    this.getVacById(id);
    this.router.navigate(['/editVac']);
  };


  
  toggleFilter(filterType: string): void {
    if (this.activeButton === filterType) {
      this.activeButton = ''; // If the same button is clicked again, deactivate it
    } else {
      this.activeButton = filterType; // Otherwise, activate the clicked button
    }
  
    // Now, based on the activeButton value, apply the appropriate filtering logic
    switch (this.activeButton) {
      
      case 'showUpcoming':
        this.showUpcomingVacations = !this.showUpcomingVacations;
        break;
      case 'showAll':
        this.showFollowingVacations = !this.showFollowingVacations;
        break;
      case 'showActive':
        this.showActiveVacations = !this.showActiveVacations;
        break;
      default:
        // When no button is active, reset the filter states and show followed vacations by default
        this.showFollowingVacations = false;
        this.showUpcomingVacations = false;
        this.showActiveVacations = false;
    }
  
    // Apply the filtering logic based on the filter states
    this.updateDisplayedVacData();
  }
  
}  
