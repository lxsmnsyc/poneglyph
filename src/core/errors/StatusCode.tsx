import { getReasonPhrase } from 'http-status-codes';

export default class StatusCode extends Error {
  public readonly value: number;

  constructor(value: number) {
    super(`${value}: ${getReasonPhrase(value)}`);

    this.value = value;
  }
}
