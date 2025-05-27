import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="table-footer">
     <div class="pagination">
      
       @if(currentPage() > 1){
        <span> <mat-icon (click)="firstPage.emit()">first_page</mat-icon></span>
       <span>
         <mat-icon (click)="prevPage.emit()">chevron_left</mat-icon>
       </span>
       
      
       <mat-icon>more_horiz</mat-icon>
         
      }<span
         class="pag">
         {{ currentPage() }}
       </span>
       @if(currentPage() < totalPages()){<mat-icon>more_horiz</mat-icon> 

         <span>
           <mat-icon (click)="nextPage.emit()">chevron_right</mat-icon>
         </span><span>
        
           <mat-icon (click)="lastPage.emit()">last_page</mat-icon>
         </span> 
         }
     </div>
     <select name="totalElements" [value]="currentPageSize()" (change)="onPageSizeChange($event)">
       @for(size of [5, 8, 10, 15, 20, 50]; track $index){
       <option [value]="size">
         {{ size }}
       </option>
       }
     </select>
   </div>
  `,
  styles: `
  
  .table-footer{
    display: grid;
    grid-template-columns: 95% 5%;
    align-items: center;
    padding: 20px 50px 0 50px;
  }
  
  mat-icon {
 font-size: 1.75rem;
 cursor: pointer;
 margin: 0 5px;
 
 }

 button{
 background-color: transparent;
 border: none;
 cursor: pointer;
 padding: 0;
 margin: 4px 0;
 }
 button:hover {
 background-color: rgba(0, 0, 0, 0.1);
 border-radius: 5px;
 }

 .pag{
  border: 1px solid black;
  border-radius: 5px;
  width: 25px;
  text-align: center;
  cursor: pointer;
  color:brown;
  font-weight: bold;
  margin: 0 5px;
 }
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px;
    
  }
  `
})
export class PaginationComponent {
   nextPage = output<void>();
  prevPage = output<void>();
  currentPage = input<number>(1);
  totalPages = input<number>(1);
  currentPageSize = input<number>(5);
  pageSize = output<number>();
  orderBy = output<string>();
  firstPage = output<void>();
  lastPage = output<void>();

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    this.pageSize.emit(newSize);
  }
}
