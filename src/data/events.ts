import { Object3DEventMap } from "three";

export interface CustomEvent {
    collision: { instanceIndex: number };
}

export type CustomEventMap = CustomEvent & Object3DEventMap;
