import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <div class="input-wrapper">
      <div class="input-container">
        <input
          class="custom-input"
          [placeholder]="placeholder()"
          [formControl]="input()"
        />
        @if(input().value){
        <mat-icon
          class="custom-input-icon"
          (click)="input().setValue('')"
          >close</mat-icon
        >}
      </div>
      <div class="input-message">{{messaggio()}}</div>
    </div>
  `,
  styles: `
    .input-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
    .input-container {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .custom-input {
      padding-right: 32px;
      height: 36px;
      font-size: 1rem;
      border-radius: 5px;
      border: 1px solid #ccc;
      width: 100%;
      box-sizing: border-box;
    }
    .custom-input-icon {
      position: absolute;
      right: 8px;
      cursor: pointer;
      color: #888;
      font-size: 20px;
      user-select: none;
    }
    .input-message {
      margin-top: 4px;
      font-size: 0.75rem;
      color: rgba(138, 1, 1, 0.7);
      padding-left: 2px;
    }
  `
})
export class InputComponent {
  placeholder= input.required<string>();
  input= input.required<FormControl>();
  messaggio= input<string>();
}
