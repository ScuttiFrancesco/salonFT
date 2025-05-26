import { Component, input, output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, FormsModule],
  template: `
    <div class="table-container">
   <table>
     <thead>
       <tr>
         @for(col of colonne(); track $index){
         <th>
           {{ col }} @if(col === 'Id' || col === 'Nome' || col === 'Cognome'
           || col === 'Giorno' || col === 'Ora'){<mat-icon (click)="orderBy.emit(col)">import_export</mat-icon>}
         </th>
         }
         <th></th>
       </tr>
     </thead>
     <tbody>
       @for(riga of righe(); track $index){
       <tr>
         @for(cella of getCellValues(riga); track $index){
         <td>
           {{ cella }}
         </td>
         }
         <td>
           @for(icon of icons(); track $index){
           <button (click)="$any(this)[icon].emit(riga.id)">
             <mat-icon [class]="icon">{{ icon }}</mat-icon>
           </button>
           }
         </td>
       </tr>
       }@empty { Nessun dato disponibile }
     </tbody>
   </table>
   <div class="table-footer">
     <div class="pagination">
       @if(currentPage() > 1){
       <span>
         <mat-icon (click)="prevPage.emit()">chevron_left</mat-icon>
       </span>
       <!--  <span> <mat-icon (click)="pageIndex = 0">first_page</mat-icon></span> <span> <mat-icon >more_horiz</mat-icon></span> -->}<span
         class="pag">
         {{ currentPage() }}
       </span>
       @if(currentPage() < totalPages()){<!-- <span>
         <mat-icon>more_horiz</mat-icon></span><span>
           <mat-icon (click)="pageIndex = totalPages - 1">last_page</mat-icon>
         </span> -->

         <span>
           <mat-icon (click)="nextPage.emit()">chevron_right</mat-icon>
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
 </div>
  `,
  styles: `

  .table-footer{
    display: grid;
    grid-template-columns: 95% 5%;
    align-items: center;
    padding: 20px 50px 0 50px;
  }

    table {
 width: 90%;
 margin: 0 auto;
 padding: 0;
 }

 .table-container {
 margin: 20px;
 padding: 20px;
 border: 1px solid #ccc;
 border-radius: 5px;
 background-color:rgba(219, 219, 219, 0.15);
 }

 

 th,td {

 padding: 5px;
 text-align: center;
 font-size: 1.25rem;
 }
 td {
 border: 1px solid black;
 padding: 5px;
 text-align: center;
 font-size: 1.25rem;
 }

 mat-icon {
 font-size: 1.75rem;
 cursor: pointer;
 margin: 0 5px;
 
 }
 .delete{
 color: rgb(138, 1, 1);
 }

 .edit{
 color: rgb(1, 133, 71);
 }
 .info{
 color: rgb(1, 69, 133);
 font-size: 1.65rem;
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
 }
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px;
    
  }
  `,
})
export class TableComponent {
  colonne = input.required<string[]>();
  righe = input.required<any>();
  info = output<any>();
  delete = output<any>();
  more_vert = output<any>();
  icons = input<string[]>(['delete', 'info', 'more_vert']);
  nextPage = output<void>();
  prevPage = output<void>();
  currentPage = input<number>(1);
  totalPages = input<number>(1);
  currentPageSize = input<number>(10); // Aggiungi questo input per il valore corrente
  pageSize = output<number>();
  orderBy = output<string>();

  getCellValues(row: any): any[] {
    return Array.isArray(row) ? row : Object.values(row);
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    this.pageSize.emit(newSize);
  }
}
