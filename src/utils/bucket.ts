import { rand, shuffle } from "./random.js";

export class Bucket<T> {
  private readonly _elements: T[];
  private _indices: number[];

  constructor(elements: T[]) {
    this._elements = elements;
    this.clear();
  }

  public pop(): T {
    if (this._indices.length === 0) throw new Error("Bucket is empty");
    const idx = this._indices.pop()!;
    return this._elements[idx];
  }

  public clear(): void {
    this._indices = this._elements.map((_, i) => i);
    shuffle(this._indices);
  }
}
