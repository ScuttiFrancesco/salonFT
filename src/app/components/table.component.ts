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
              {{ col }} @if(col === 'Id' || col === 'Nome' || col === 'Cognome' || col === 'Giorno' || col === 'Ora'){<mat-icon (click)="orderBy(col)">import_export</mat-icon>}
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
       <span> <mat-icon (click)="prevPage()">chevron_left</mat-icon></span>
       <span> <mat-icon (click)="pageIndex = 0">first_page</mat-icon></span> <span> <mat-icon >more_horiz</mat-icon></span>}<span class="pag">
          {{ pageIndex + 1 }}
        </span>
        @if(pageIndex < totalPages - 1){<span> <mat-icon >more_horiz</mat-icon></span><span><mat-icon (click)="pageIndex = totalPages - 1">last_page</mat-icon></span>
        
         <span> <mat-icon (click)="nextPage()">chevron_right</mat-icon></span>
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
  orderedRighe : any[] = [];
  isAscending = true; // Traccia la direzione dell'ordinamento
  lastSortedColumn: string | null = null; // Traccia l'ultima colonna ordinata

  pageSizes = [8, 16, 32];
  pageSize = 8;
  pageIndex = 0;

  get totalPages(): number {
    return Math.ceil((this.orderedRighe.length > 0 ? this.orderedRighe.length : this.righe().length) / this.pageSize) || 1;
  }

  pagedRows() {
    const dataSource = this.orderedRighe.length > 0 ? this.orderedRighe : this.righe();
    const start = this.pageIndex * this.pageSize;
    return dataSource.slice(start, start + this.pageSize);
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
  
  orderBy(col: string) {
    console.log('ordinamento per colonna:', col);

    // Inverti la direzione se la colonna è la stessa
    if (this.lastSortedColumn === col) {
      this.isAscending = !this.isAscending;
    } else {
      this.lastSortedColumn = col;
      this.isAscending = true; // Inizia con ordinamento ascendente per nuova colonna
    }

    // Lavora con una copia dei dati per evitare problemi
    const dataToSort = [...this.righe()];
    
    // Ordinamento basato sulla direzione
    this.orderedRighe = dataToSort.sort((a, b) => {
      // Normalizza i valori per il confronto
      const valA = this.getNormalizedValue(a, col);
      const valB = this.getNormalizedValue(b, col);
      
      // Confronta in base alla direzione corrente
      if (this.isAscending) {
        return valA > valB ? 1 : valA < valB ? -1 : 0;
      } else {
        return valA < valB ? 1 : valA > valB ? -1 : 0;
      }
    });
    
    // Torna alla prima pagina dopo l'ordinamento
    this.pageIndex = 0;
    
    // Debug
    console.log('Dati ordinati:', this.orderedRighe);
  }
  
  // Metodo per ottenere il valore normalizzato per il confronto
  private getNormalizedValue(item: any, column: string): any {
    // Mappa i nomi delle colonne visualizzate ai nomi delle proprietà nei dati
    const columnMap: Record<string, string> = {
      'Id': 'id',
      'Nome': 'name',
      'Cognome': 'surname',
      'Email': 'email',
      'Telefono': 'phoneNumber',
      'Cliente': 'customerName',
      'Giorno': 'date',
      'Ora': 'time',
      'Durata': 'duration',
      // Aggiungi altre mappature se necessario
    };
    
    // Usa la mappatura se esiste, altrimenti usa il nome della colonna originale
    const propertyName = columnMap[column] || column.toLowerCase();
    const value = item[propertyName];
    
    // Gestisci tipi speciali per il confronto corretto
    if (column === 'Giorno') {
      // Per date in formato italiano DD/MM/YYYY, converti per un confronto corretto
      const parts = value.split('/');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    
    return value;
  }
}
