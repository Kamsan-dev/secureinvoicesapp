import { BreakpointObserver } from '@angular/cdk/layout';
import { EventEmitter, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const BreakpointNames = {
  phone: 'phone',
  tablet: 'tablet',
  desktop: 'desktop',
};

class Breakpoint {
  public name: string;
  public query: string;

  public constructor(name: any, query: any) {
    this.name = name;
    this.query = query;
  }
}

// Warning: if you edit one of these values, you should edit
//              SCSS breakpoint in '_variables.scss' AND '_variables.bootstrap.scss'
const breakpoints: Breakpoint[] = [
  new Breakpoint(BreakpointNames.phone, '(max-width: 449px)'),
  new Breakpoint(BreakpointNames.tablet, '(max-width: 1023px) and (min-width: 450px)'),
  new Breakpoint(BreakpointNames.desktop, '(min-width: 1024px)'),
];

@Injectable({
  providedIn: 'root',
})
export class ResponsiveService {
  public phone = signal(false);
  public tablet = signal(false);
  public desktop = signal(false);

  private activeBreakpoints!: string[];
  private lastHeight!: number;
  //   public get isHybrideApp(): boolean {
  //     return this.reactNativeAppService.isReactNativeApp;
  //   }

  public onWindowMouseWheel: EventEmitter<any> = new EventEmitter();

  constructor(
    private breakpointObserver: BreakpointObserver,
    //public reactNativeAppService: ReactNativeAppService,
  ) {
    this.refreshViewHeight();
    window.addEventListener('resize', this.refreshViewHeight.bind(this));
    window.addEventListener('wheel', (e) => this.onWindowMouseWheel?.emit(e));
  }

  public get isPhone(): boolean {
    return this.phone();
  }
  public get isTablet(): boolean {
    return this.tablet();
  }
  public get isDesktop(): boolean {
    return this.desktop();
  }

  public observe(): Observable<string[]> {
    const queries = breakpoints.map((b) => b.query);
    return this.breakpointObserver.observe(queries).pipe(
      map((observerResponse) => {
        const breakpointNames = this.parseObserverResponse(observerResponse.breakpoints);
        this.phone.set(breakpointNames.includes(BreakpointNames.phone));
        this.tablet.set(breakpointNames.includes(BreakpointNames.tablet));
        this.desktop.set(breakpointNames.includes(BreakpointNames.desktop));
        return breakpointNames;
      }),
    );
  }

  private parseObserverResponse(responseBreakpoints: any): string[] {
    const active: any = [];

    Object.keys(responseBreakpoints).map((key) => {
      if (responseBreakpoints[key]) {
        const name = breakpoints.filter((b) => b.query === key)[0].name;
        active.push(name);
      }
    });

    this.activeBreakpoints = active;
    return this.activeBreakpoints;
  }

  private refreshViewHeight() {
    if (this.lastHeight !== window.innerHeight) {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      this.lastHeight = window.innerHeight;
    }
  }
}
