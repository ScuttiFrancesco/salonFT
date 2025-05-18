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
          [value]="value"
          (input)="onInput($event)"
          (blur)="onTouched()"
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
  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(obj: any): void {
    this.value = obj ?? '';
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
    const v = (event.target as HTMLInputElement).value;
    this.value = v;
    this.onChange(v);
  }

  clear() {
    this.writeValue('');
    this.onChange('');
  }
}
