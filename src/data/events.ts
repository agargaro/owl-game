import { Object3DEventMap } from "three";

export interface CustomEvent {
    collision: { instanceIndex: number };
}

export interface ItemEvent extends CustomEvent {
    active: { itemIndex: number };
}

export type CustomEventMap = CustomEvent & Object3DEventMap;
export type ItemEventMap = ItemEvent & Object3DEventMap;
