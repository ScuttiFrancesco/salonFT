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
         @for(col of getVisibleColumns(); track $index){
         <th>
           {{ col }} @if(col === 'Id' || col === 'Nome' || col === 'Cognome'
           || col === 'Giorno' || col === 'Durata' || col === 'Cliente' || col === 'Totale'){<mat-icon (click)="orderBy.emit(col)">import_export</mat-icon>}
         </th>
         }
         <th></th>
       </tr>
     </thead>
     <tbody>
       @for(riga of righe(); track trackByFn() ? trackByFn()!($index, riga) : $index){
       <tr>
         @for(cella of getVisibleCellValues(riga); track $index; let colIndex = $index){
         <td 
            (click)="getVisibleColumns()[colIndex] === 'Id-App.' && riga.fullData ? infoApp.emit(riga.fullData.appointmentId) : null"
            [style.cursor]="getVisibleColumns()[colIndex] === 'Id-App.' && riga.fullData ? 'pointer' : 'default'"
            [style.text-decoration]="getVisibleColumns()[colIndex] === 'Id-App.' && riga.fullData ? 'underline' : 'none'"
            [style.color]="getVisibleColumns()[colIndex] === 'Id-App.' && riga.fullData ? 'brown' : 'inherit'">
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

/*   .table-footer{
    display: grid;
    grid-template-columns: 95% 5%;
    align-items: center;
    padding: 20px 50px 0 50px;
  } */

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
  visibleColumns = input<string[]>(); // Nuove colonne da mostrare
  info = output<any>();
  delete = output<any>();
  more_vert = output<any>();
  icons = input<string[]>(['delete', 'info', 'more_vert']);
  orderBy = output<string>();
  infoApp = output<any>();

  getVisibleColumns(): string[] {
    const visible = this.visibleColumns();
    return visible ? visible : this.colonne();
  }

  getCellValues(row: any): any[] {
    return Array.isArray(row) ? row : Object.values(row);
  }

  getVisibleCellValues(row: any): any[] {
    const visibleCols = this.getVisibleColumns(); // Ottieni le colonne effettivamente visualizzate
    const allCols = this.colonne(); // Colonne originali passate come input

    if (typeof row !== 'object' || row === null) {
      return Array.isArray(row) ? row : Object.values(row);
    }

    // Mappa i valori basandosi sull'ordine delle colonne visibili
    // e sulle chiavi dell'oggetto 'row' che dovrebbero corrispondere
    // a come 'righeComputed' ha strutturato l'oggetto.
    return visibleCols.map(visibleColName => {
      // Trova l'indice della colonna visibile nell'array originale delle colonne
      // per sapere a quale proprietà dell'oggetto 'row' corrisponde.
      // Questo assume che 'righeComputed' crei oggetti le cui chiavi
      // sono derivate o indicizzate in modo simile a 'colonne()'.

      // Se 'righeComputed' mappa direttamente a valori nell'ordine di 'visibleCols',
      // allora l'approccio deve essere diverso.
      // L'oggetto 'row' passato qui è quello prodotto da 'righeComputed'.
      // Es: row = { id: 1, customerName: 'Test', date: '01/01/2024', total: 100, appointmentId: 5, fullData: {...} }
      // E visibleCols = ['Id', 'Cliente', 'Giorno', 'Totale', 'Id-App.']

      // Dobbiamo mappare 'Id' a row.id, 'Cliente' a row.customerName, etc.
      // 'Id-App.' dovrebbe mappare a row.appointmentId.

      switch(visibleColName) {
        case 'Id': return row.id;
        case 'Cliente': return row.customerName;
        case 'Giorno': return row.date; // o row.day se hai una prop specifica
        case 'Ora': return row.time;
        case 'Durata': return row.duration;
        case 'Telefono': return row.phoneNumber;
        case 'Email': return row.email;
        case 'Nome': return row.name;
        case 'Cognome': return row.surname;
        case 'Totale': return row.total;
        case 'Id-App.': return row.appointmentId; // Questa è la chiave importante
        default:
          // Fallback se la colonna non ha una mappatura esplicita
          // Cerca una chiave nell'oggetto 'row' che corrisponda (case-insensitive, o logica simile)
          const matchingKey = Object.keys(row).find(key => key.toLowerCase() === visibleColName.toLowerCase().replace('-', ''));
          return matchingKey ? row[matchingKey] : '';
      }
    });
  }
}
