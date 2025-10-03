import { Object3DEventMap } from "three";

export interface CustomEvent {
    collision: { instanceIndex: number };
}

export interface CoinEvent extends CustomEvent {
    collected: { count: number };
}

export interface ItemEvent extends CustomEvent {
    active: { itemIndex: number };
}

export type DefaultEventMap = CustomEvent & Object3DEventMap;
export type CoinEventMap = CoinEvent & Object3DEventMap;
export type ItemEventMap = ItemEvent & Object3DEventMap;
