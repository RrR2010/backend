import { Id } from '@shared/value-objects'

export type Constructor<T = object> = abstract new (...args: any[]) => T

export abstract class Base<Props extends object> {
  protected readonly _props: Props

  constructor(props: Props) {
    this._props = props
  }
}
