import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { DataState } from 'src/app/enums/datastate.enum';
import { Statistics } from 'src/app/interfaces/appstate';

@Component({
  selector: 'se-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsComponent {
  public readonly statsSig = signal<Statistics | undefined>(undefined);
  @Input() public set stats(stats: Statistics | undefined) {
    this.statsSig.set(stats);
  }

  public readonly dataStateSig = signal<DataState>(DataState.LOADED);
  @Input() public set dataState(dataState: DataState) {
    this.dataStateSig.set(dataState);
  }
}
