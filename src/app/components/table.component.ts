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
              {{ col }}
            </th>
            }
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for(riga of pagedRows(); track $index){
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
      <div class="pagination">
        @if(pageIndex > 0){
        <mat-icon (click)="prevPage()">chevron_left</mat-icon>
        <mat-icon (click)="pageIndex = 0">first_page</mat-icon> }<span class="pag">
          {{ pageIndex + 1 }}
        </span>
        @if(pageIndex < totalPages - 1){<mat-icon (click)="pageIndex = totalPages - 1">last_page</mat-icon>

          <mat-icon (click)="nextPage()">chevron_right</mat-icon>
          }
      </div>
    </div>
  `,
  styles: `

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
    gap: 10px;
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

  pageSizes = [8, 16, 32];
  pageSize = 8;
  pageIndex = 0;

  get totalPages(): number {
    return Math.ceil(this.righe().length / this.pageSize) || 1;
  }

  pagedRows() {
    const start = this.pageIndex * this.pageSize;
    return this.righe().slice(start, start + this.pageSize);
  }

  getCellValues(row: any): any[] {
    return Array.isArray(row) ? row : Object.values(row);
  }

  onPageSizeChange() {
    this.pageIndex = 0;
  }

  prevPage() {
    if (this.pageIndex > 0) this.pageIndex--;
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) this.pageIndex++;
  }
}
