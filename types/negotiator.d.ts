declare module "negotiator" {
  export default class Negotiator {
    constructor(headers: { headers: Record<string, string> });
    languages(supported: readonly string[]): string[];
  }
}
