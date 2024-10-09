import { AfterViewInit, ChangeDetectionStrategy, Component, computed, Input, numberAttribute, signal, ViewEncapsulation } from '@angular/core';

export declare type DgdCoreProgressSpinnerSize = 's' | 'm' | 'l';
export declare type DgdCoreProgressSpinnerMode = 'determinate' | 'indeterminate';
export declare type DgdCoreProgressSpinnerColor = 'primary' | 'dark';
@Component({
  selector: 'se-progress-spinner',
  templateUrl: './se-progress-spinner.component.html',
  styleUrls: ['./se-progress-spinner.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'se-progress-spinner',
    '[class.indeterminate]': 'modeSig() === "indeterminate"',
    '[style.width.px]': 'circleDiameter()',
    '[style.height.px]': 'circleDiameter()',
    '[attr.aria-valuemin]': '0',
    '[attr.aria-valuemax]': '100',
    '[attr.aria-valuenow]': 'modeSig() === "determinate" ? valueSig() : null',
    '[attr.mode]': 'modeSig()',
  },
})
export class SeProgressSpinnerComponent {
  private static _sizeDiameterMapper: { [key in DgdCoreProgressSpinnerSize]: number } = { s: 20, m: 32, l: 52 };
  private static _sizeStrokeWidthMapper: { [key in DgdCoreProgressSpinnerSize]: number } = { s: 2, m: 3, l: 4 };

  private readonly _size = signal<DgdCoreProgressSpinnerSize>('m');
  @Input() public set size(size: DgdCoreProgressSpinnerSize) {
    this._size.set(size);
  }
  public readonly modeSig = signal<DgdCoreProgressSpinnerMode>('determinate');
  @Input() public set mode(size: DgdCoreProgressSpinnerMode) {
    this.modeSig.set(size);
  }

  public readonly colorSig = signal<DgdCoreProgressSpinnerColor>('primary');
  @Input() public set color(color: DgdCoreProgressSpinnerColor) {
    this.colorSig.set(color);
  }

  private readonly _value = signal(0);
  public readonly valueSig = computed(() => (this.modeSig() === 'determinate' ? this._value() : 0));
  @Input({ transform: numberAttribute }) public set value(v: number) {
    this._value.set(Math.max(0, Math.min(100, v || 0)));
  }

  public readonly strokeWidth = computed(() => SeProgressSpinnerComponent._sizeStrokeWidthMapper[this._size()]);
  public readonly circleDiameter = computed(() => SeProgressSpinnerComponent._sizeDiameterMapper[this._size()]);
  public readonly circleRadius = computed(() => this.circleDiameter() / 2);
  public readonly viewBox = computed(() => {
    const viewBox = this.circleRadius() * 2 + this.strokeWidth();
    return `0 0 ${viewBox} ${viewBox}`;
  });
  public readonly strokeCircumference = computed(() => 2 * Math.PI * this.circleRadius());
  public readonly strokeDashOffset = computed(() => {
    return this.modeSig() === 'determinate' ? (this.strokeCircumference() * (100 - this.valueSig())) / 100 : (this.strokeCircumference() * 60) / 100;
  });
  public readonly circleStrokeWidth = computed(() => (this.strokeWidth() * 100) / this.circleDiameter());
}
