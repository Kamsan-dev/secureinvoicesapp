import {
  AfterContentInit,
  AfterViewInit,
  booleanAttribute,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { DgdCoreCheckboxSelectedChangeEvent } from '../models/dgd-core-checkbox-selected-change.models';

const DGD_CORE_CHECKBOX_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DgdCoreCheckboxComponent),
  multi: true,
};

export const DGD_CORE_CHECKBOX_CONTROL_VALIDATOR = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => DgdCoreCheckboxComponent),
  multi: true,
};

let nextUniqueId = 0;

@Component({
  selector: 'dgd-core-checkbox',
  templateUrl: './dgd-core-checkbox.component.html',
  providers: [DGD_CORE_CHECKBOX_VALUE_ACCESSOR],
  styleUrls: ['./dgd-core-checkbox.component.scss'],
})
export class DgdCoreCheckboxComponent implements ControlValueAccessor, Validator, OnChanges, AfterViewInit, AfterContentInit {
  public readonly disabledSig = signal(false);
  @Input({ transform: booleanAttribute }) public set disabled(disabled: boolean) {
    this.disabledSig.set(disabled);
    this._disabled.set(disabled);
    this.handleDisableState();
  }

  public readonly checkedSig = signal<boolean | null>(null);
  @Input({ transform: booleanAttribute }) public set checked(checked: boolean | null) {
    this.checkedSig.set(checked);
    this.indeterminate = false;
  }

  public readonly indeterminateSig = signal(false);
  @Input({ transform: booleanAttribute }) public set indeterminate(indeterminate: boolean) {
    this.indeterminateSig.set(indeterminate);
    this.onIndeterminateChange.emit(this.indeterminateSig());
    this._syncIndeterminate(this.indeterminateSig());
  }
  @Input() public onClick: ((event: MouseEvent) => Promise<any>) | undefined;

  /** Whether the label should appear after or before the checkbox. Defaults to 'after' */
  @Input() public labelPosition: 'before' | 'after' = 'after';

  /** Whether the checkbox is required. */
  public readonly requiredSig = signal(false);
  @Input({ transform: booleanAttribute }) public set required(required: boolean) {
    this.requiredSig.set(required);
  }

  /** The value attribute of the native input element */
  public readonly valueSig = signal<string | null>(null);
  @Input() public set value(v: string) {
    if (v) {
      this.valueSig.set(v);
    }
  }

  /** Name value will be applied to the input element if present */
  public readonly nameSig = signal<string | null>(null);
  @Input() public set name(value: string) {
    if (value) {
      this.nameSig.set(value);
    }
  }
  /* identifier auto-generated if it is not provided */
  public readonly identifierSig = signal(`dgd-core-checkbox-${nextUniqueId++}-input`);
  @Input() public set identifier(value: string) {
    if (value) {
      this.identifierSig.set(value);
    }
  }

  @Output()
  public readonly onCheckedChange: EventEmitter<DgdCoreCheckboxSelectedChangeEvent> = new EventEmitter<DgdCoreCheckboxSelectedChangeEvent>();
  @Output() public readonly onIndeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('input', { static: false })
  public inputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('label', { static: false })
  public labelElement?: ElementRef<HTMLLabelElement>;
  @ViewChild('checkboxContainer', { static: false })
  public containerElement?: ElementRef<HTMLDivElement>;

  /* private properties */
  private readonly working = signal(false);
  private readonly _disabled = signal(false);

  constructor() {}

  public ngAfterViewInit(): void {
    this._syncIndeterminate(this.indeterminateSig());
  }

  public ngAfterContentInit(): void {
    /* label is removed from the DOM if it has not children elements */
    setTimeout((): void => {
      this._updateLabelPosition();
      if (this.labelElement?.nativeElement.childNodes.length === 0) {
        this.labelElement.nativeElement.remove();
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['required']) {
      this._validatorChangeFn();
    }
  }

  //#region ControlValueAccessor

  public regOnChange = (_: any) => {};
  private _validatorChangeFn = () => {};

  // Implemented as a part of Validator.
  public validate(control: AbstractControl<boolean>): ValidationErrors | null {
    return this.requiredSig() && control.value !== true ? { required: true } : null;
  }

  // Implemented as a part of Validator.
  public registerOnValidatorChange(fn: () => void): void {
    this._validatorChangeFn = fn;
  }

  public regOnTouched = (_: any) => {};

  public registerOnChange(fn: any): void {
    this.regOnChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.regOnTouched = fn;
  }

  public writeValue(value: any): void {
    this.checkedSig.set(value);
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabledSig.set(isDisabled);
  }

  public onChanged($event: any): void {
    if ($event.target && !this.disabledSig()) {
      this.checkedSig.set($event.target.checked);
      this.regOnChange($event.target.checked);
      this.onCheckedChange.emit({
        checked: this.checkedSig(),
      } as DgdCoreCheckboxSelectedChangeEvent);
    }
  }

  public async onClicked(event: MouseEvent): Promise<void> {
    if (!this.onClick || this.disabledSig()) return;

    event.preventDefault();
    this.working.set(true);
    this.handleDisableState();
    this.inputElement!.nativeElement.classList.add('loading');
    try {
      await this.onClick(event);
    } catch {
      /* ignored */
    }
    this.inputElement!.nativeElement.classList.remove('loading');
    this.working.set(false);
    this.handleDisableState();
  }
  private handleDisableState(): void {
    if (this._disabled() || this.working()) {
      this.disabledSig.set(true);
    } else {
      this.disabledSig.set(false);
    }
  }

  private _syncIndeterminate(value: boolean): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.indeterminate = value;
    }
  }

  private _updateLabelPosition(): void {
    if (this.labelPosition === 'before') {
      const labelElement = this.labelElement?.nativeElement;
      const inputElement = this.inputElement?.nativeElement;
      const checkboxContainer = this.containerElement?.nativeElement;

      if (labelElement && inputElement && checkboxContainer) {
        checkboxContainer.insertBefore(labelElement, inputElement);
      }
    }
  }
}
