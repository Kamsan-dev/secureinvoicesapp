export class DgdCoreCheckboxSelectedChangeEvent {
  public checked: boolean = false;

  constructor(values: object = {}) {
    Object.assign(this, values);
  }
}
