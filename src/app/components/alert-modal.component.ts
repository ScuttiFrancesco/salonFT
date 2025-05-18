import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-alert-modal',
  standalone: true,
  imports: [],
  template: `
    <div class="modal-container">
      <div class="modal-content">
        <h2>
          @if (alert()) { MESSAGGIO }@else if (confirmation()) { CONFERMA }
        </h2>
        <p>{{ message() }}</p>
        <div class="buttons-container">
          <button class="close-button" (click)="confirm.emit(false)">
            Cancel
          </button>
          @if(confirmation()){
          <button class="delete-button" (click)="confirm.emit(true)">
            Confirm</button>}
        </div>
      </div>
    </div>
  `,
  styles: `

    h2{
        font-weight: bold;        
        font-size: 2rem;
        text-align: center;
        margin-bottom: 20px;
    }

    .modal-container {
    padding: 16px 24px;
    background-color: #f9f9f9;
    border-radius: 5px;
    box-shadow: 2px 6px 8px rgba(0, 0, 0, 0.5);
    width: fit-content;
    min-width: 600px;
    height: fit-content;
    max-height: 80vh;
    overflow-y: auto;
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    
    }
  button {
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
    }

    .close-button {
    background-color:rgba(0, 0, 0, 0.65);
    }
    .close-button:hover {
    background-color: rgba(0, 0, 0, 0.55);
    }

    .delete-button {
    background-color:rgba(56, 0, 0, 0.75);
    }
    .delete-button:hover {
    background-color: rgba(54, 0, 0, 0.65);
    }
  `,
})
export class AlertModalComponent {
  alert = input<boolean>(false);
  confirmation = input<boolean>(false);
  confirm = output<boolean>();
  message = input.required<string>();
}
