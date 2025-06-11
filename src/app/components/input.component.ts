import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="input-wrapper">
      <div class="input-container">
        <input
          class="custom-input"
          [class]="style"
          [placeholder]="placeholder"
          [type]="type"
          [value]="displayValue"
          (input)="onInput($event)"
          (blur)="onBlur($event)"
          (focus)="onFocus($event)"
        />
        @if(value){
        <mat-icon class="custom-input-icon" (click)="clear()">close</mat-icon>
        }
      </div>
      <div class="input-message">{{ messaggio }}</div>
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
      height: 2.25rem;
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
  `,
})
export class InputComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() type: string = 'text';
  @Input() messaggio = '';
  @Input() style = [''];

  value = '';
  displayValue = '';
  private isFocused = false;
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value = obj ?? '';
    this.updateDisplayValue();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // gestisci stato disabled se serve
  }

  onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    // Per input numerici, gestisci virgola e punto
    if (this.type === 'number') {
      // Sostituisci la virgola con il punto per la gestione interna
      inputValue = inputValue.replace(',', '.');

      // Verifica che sia un numero valido (inclusi decimali)
      if (inputValue !== '' && inputValue !== '.' && isNaN(Number(inputValue))) {
        // Se non è un numero valido, ripristina il valore precedente
        inputElement.value = this.displayValue;
        return;
      }
    }

    this.value = inputValue;
    this.displayValue = inputValue;
    this.onChange(inputValue);
  }

  onFocus(event: Event) {
    this.isFocused = true;
    const inputElement = event.target as HTMLInputElement;

    // Per i numeri, mostra sempre con il punto durante l'editing
    if (this.type === 'number' && this.value) {
      this.displayValue = this.value.replace(',', '.');
      inputElement.value = this.displayValue;
    }
  }

  onBlur(event: Event) {
    this.isFocused = false;
    this.onTouched();

    // Per i numeri, converti eventualmente il punto in virgola per la visualizzazione
    if (this.type === 'number' && this.value) {
      const numericValue = parseFloat(this.value.replace(',', '.'));
      if (!isNaN(numericValue)) {
        // Mantieni il valore interno con il punto per compatibilità
        this.value = numericValue.toString();
        // Per la visualizzazione, puoi scegliere se usare virgola o punto
        // In questo caso manteniamo il punto per compatibilità con HTML5
        this.displayValue = this.value;
        this.onChange(this.value);
      }
    }

    this.updateDisplayValue();
  }

  private updateDisplayValue() {
    if (this.type === 'number' && this.value && !this.isFocused) {
      // Durante la visualizzazione (non in focus), formatta il numero
      const numericValue = parseFloat(this.value.replace(',', '.'));
      if (!isNaN(numericValue)) {
        this.displayValue = numericValue.toString();
      } else {
        this.displayValue = this.value;
      }
    } else {
      this.displayValue = this.value;
    }
  }

  clear() {
    this.writeValue('');
    this.onChange('');
  }
}
