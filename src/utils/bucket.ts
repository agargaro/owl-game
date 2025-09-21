import { rand } from "./random.js";

// TODO add shuffle idea

export class Bucket {
  private _elements: number[];
  private _indices: number[];
  private _capacity: number;

  constructor(elements: number[]) {
    this._elements = elements;
    this._capacity = elements.length;
    this._indices = new Array(this._capacity).fill(0).map((v, i) => i);
  }

  public pop(): number {
    const index = rand(this._indices.length - 1);
    const element = this._elements[this._indices[index]];
    this._indices.splice(index, 1);
    return element;
  }

  public clear(): void {
    this._indices.length = 3;
    this._indices = this._indices.fill(0).map((v, i) => i);
  }
}
