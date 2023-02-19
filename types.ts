export interface Authentication {
  /** The authenticate scheme.
   * @example Basic
   */
  readonly scheme: string;
  readonly authenticate: Authenticate;
  readonly params?: Record<string, string>;
}

export interface Authenticate {
  (token: string): boolean | Promise<boolean>;
}
