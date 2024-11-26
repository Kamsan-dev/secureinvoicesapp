import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { DataState } from 'src/app/enums/datastate.enum';
import { UserEvent } from 'src/app/interfaces/appstate';

export type typeEvent = 'failure' | 'success' | 'attempt' | 'update';

@Component({
  selector: 'se-profile-events-history',
  templateUrl: './profile-events-history.component.html',
  styleUrls: ['./profile-events-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileEventsHistoryComponent {
  public readonly dataStateSig = signal<DataState>(DataState.LOADED);
  @Input() public set dataState(dataState: DataState) {
    this.dataStateSig.set(dataState);
  }

  public readonly loadingSig = signal(false);
  @Input() public set loading(bool: boolean) {
    this.loadingSig.set(bool);
  }

  public readonly userEventsSig = signal<UserEvent[]>([]);
  @Input() public set userEvents(tab: UserEvent[]) {
    this.userEventsSig.set(tab);
  }

  public getTypeEvent(eventType: string): typeEvent {
    if (eventType.endsWith('FAILURE')) {
      return 'failure';
    } else if (eventType.endsWith('SUCCESS')) {
      return 'success';
    } else if (eventType.endsWith('ATTEMPT')) {
      return 'attempt';
    } else if (eventType.endsWith('UPDATE')) {
      return 'update';
    }
    // Default to 'success' if the type doesn't explicitly match
    return 'success';
  }

  public getEventTypeClassColor(eventType: string): string {
    switch (this.getTypeEvent(eventType)) {
      case 'success':
        return 'bg-success';
      case 'failure':
        return 'bg-danger';
      case 'attempt':
        return 'bg-warning';
      case 'update':
        return 'bg-info';
      default:
        return 'bg-success';
    }
  }
}
