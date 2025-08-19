// SimpleVirtualJoystick.ts
import { EventDispatcher, Vector2 } from "three";

type PublicDataProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

type MoveMsg = { direction: Vector2; force: number };

let joystickID = 0;

export const isMobile = () => {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone|webOS/i.test(navigator.userAgent);
};

export class VirtualJoystick extends EventDispatcher<{ move: MoveMsg }> {
  radius = 50;          //  in pixel
  deadzone = 0.08;      // 0..1
  fadeMs = 120;         // show/hide
  analogResetMs = 90;          // analog snap
  fixedCenter: { x: number; y: number } | null = null; // useefull to fix joystick

  // dom
  root!: HTMLDivElement;
  back!: HTMLDivElement;
  analog!: HTMLDivElement;

  // state
  private pointerId: number | null = null;
  private origin = new Vector2();

  constructor(init?: PublicDataProps<VirtualJoystick>) {
    super();
    if (!isMobile()) {
      Object.assign(this, init);
      this.makeDom();
    }
  }

  connect(dom: HTMLElement | Document = document) {
    dom.addEventListener<'pointerdown'>("pointerdown", this.onDown, { passive: false });
    dom.addEventListener<'pointermove'>("pointermove", this.onMove, { passive: false });
    dom.addEventListener<'pointerup'>("pointerup", this.onUp, { passive: false });
    dom.addEventListener<'pointercancel'>("pointercancel", this.onUp, { passive: false });
  }

  disconnect(dom: HTMLElement | Document = document) {
    dom.removeEventListener("pointerdown", this.onDown);
    dom.removeEventListener("pointermove", this.onMove);
    dom.removeEventListener("pointerup", this.onUp);
    dom.removeEventListener("pointercancel", this.onUp);
  }

  dispose() {
    this.disconnect();
    this.root.remove();
  }

  place(x: number, y: number) {
    this.root.style.left = `${x - this.radius}px`;
    this.root.style.top = `${y - this.radius}px`;
  }

  private onDown = (e: PointerEvent) => {
    if (this.pointerId !== null) return;
    this.pointerId = e.pointerId;

    if (this.fixedCenter) {
      this.origin.set(this.fixedCenter.x, this.fixedCenter.y);
      this.place(this.fixedCenter.x, this.fixedCenter.y);
    } else {
      this.origin.set(e.clientX, e.clientY);
      this.place(e.clientX, e.clientY);
    }

    this.show();
    (e.target as Element | Document).setPointerCapture?.(e.pointerId);
    this.updateFromEvent(e);
    e.preventDefault();
  };

  private onMove = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    this.updateFromEvent(e);
    e.preventDefault();
  };

  private onUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointerId) return;
    (e.target as Element | Document).releasePointerCapture?.(e.pointerId);
    this.pointerId = null;

    // snap to center, then fade out
    this.analog.style.transform = `translate(0px, 0px)`;
    setTimeout(() => this.hide(), this.analogResetMs);
    e.preventDefault();
  };

  private updateFromEvent(e: PointerEvent) {
    const dx = e.clientX - this.origin.x;
    const dy = e.clientY - this.origin.y;

    // clamp to radius
    const v = new Vector2(dx, dy);
    const r = this.radius;
    if (v.lengthSq() > r * r) v.setLength(r);

    // move knob
    this.analog.style.transform = `translate(${v.x}px, ${v.y}px)`;

    // emit move
    const nx = v.x / r, ny = v.y / r;
    const dir = new Vector2(nx, ny);
    const mag = Math.min(1, dir.length());
    const dz = this.deadzone;

    let direction = new Vector2(0, 0);
    let force = 0;
    if (mag > dz) {
      if (mag > 0) direction.copy(dir).multiplyScalar(1 / mag);
      force = (mag - dz) / (1 - dz);
    }

    this.dispatchEvent({ type: "move", direction, force });

  }

  private makeDom() {
    const size = this.radius * 2;

    this.root = document.createElement("div");
    this.root.id = "virtual-joystick-" + ++joystickID;
    Object.assign(this.root.style, {
      position: "fixed",
      left: "0px",
      top: "0px",
      width: `${size}px`,
      height: `${size}px`,
      transform: "translate(-9999px, -9999px) scale(0.9)",
      transformOrigin: "center",
      opacity: "0",
      transition: `opacity ${this.fadeMs}ms, transform ${this.fadeMs}ms`,
      pointerEvents: "none",
      zIndex: "9999",
    } as CSSStyleDeclaration);

    this.back = document.createElement("div");
    Object.assign(this.back.style, {
      position: "absolute",
      inset: "0",
      borderRadius: "50%",
      background: "#ffffff26",
      boxShadow: "0 0 0 2px #ffffff40 inset",
    } as CSSStyleDeclaration);

    const knob = Math.round(this.radius * 0.80);
    this.analog = document.createElement("div");
    Object.assign(this.analog.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      width: `${knob}px`,
      height: `${knob}px`,
      marginLeft: `${-knob / 2}px`,
      marginTop: `${-knob / 2}px`,
      borderRadius: "50%",
      background: "#ffffffb3",
      boxShadow: "0 8px 18px #0003",
      transform: "translate(0px, 0px)",
      transition: `transform ${this.analogResetMs}ms`,
    } as CSSStyleDeclaration);

    this.root.append(this.back, this.analog);
    document.body.appendChild(this.root);
  }

  private show() {
    this.root.style.opacity = "1";
    this.root.style.transform = "translate(0px, 0px) scale(1)";
  }

  private hide() {
    this.root.style.opacity = "0";
    this.root.style.transform = "translate(0px, 0px) scale(0.9)";
  }
}

