import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, FormsModule],
  template: `
    <div class="table-container">
   <table>
     <thead>
       <tr>
         @for(col of colonne(); track $index){
         <th>
           {{ col }} @if(col === 'Id' || col === 'Nome' || col === 'Cognome'
           || col === 'Giorno' || col === 'Durata' || col === 'Cliente'){<mat-icon (click)="orderBy.emit(col)">import_export</mat-icon>}
         </th>
         }
         <th></th>
       </tr>
     </thead>
     <tbody>
       @for(riga of righe(); track trackByFn() ? trackByFn()!($index, riga) : $index){
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
   <ng-content></ng-content>
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
  margin: 0 5px;
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
  trackByFn = input<(index: number, item: any) => any>();
  info = output<any>();
  delete = output<any>();
  more_vert = output<any>();
  icons = input<string[]>(['delete', 'info', 'more_vert']);
  orderBy = output<string>();

  getCellValues(row: any): any[] {
    return Array.isArray(row) ? row : Object.values(row);
  }
}
