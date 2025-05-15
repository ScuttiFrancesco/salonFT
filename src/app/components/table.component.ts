import { Component, input } from '@angular/core';

import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, FormsModule],
  template: `
    <div class="title">Lista Clienti</div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            @for(col of colonne(); track $index){
            <th>
              {{ col }}
            </th>
            }
            <th>Azioni</th>
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
              <button><mat-icon class="edit">edit</mat-icon></button>
              <button><mat-icon class="delete">delete</mat-icon></button>
              <button><mat-icon class="info">info</mat-icon></button>
            </td>
          </tr>
          }
        </tbody>
      </table>
      <div class="pagination">
        <button (click)="prevPage()" [disabled]="pageIndex === 0">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <span class="pag"> {{ pageIndex + 1 }} </span>
        <button (click)="nextPage()" [disabled]="pageIndex >= totalPages - 1">
          <mat-icon>chevron_right</mat-icon>
        </button>
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

 .title {
 font-size: 1.75rem;
 font-weight: 500;
 margin: 20px;
 text-align: center;
 color: rgb(75, 75, 75);;
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
 margin: 4px;
 }
 button:hover {
 background-color: rgba(0, 0, 0, 0.1);
 border-radius: 5px;
 }

 .pag{
  border: 1px solid black;
  border-radius: 50px;
  width: 25px;
  text-align: center;
  cursor: pointer;
 }
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px;
  }
  `,
})
export class TableComponent {
  colonne = input.required<string[]>();
  righe = input.required<any>();

  pageSizes = [10, 25, 50];
  pageSize = 10;
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
