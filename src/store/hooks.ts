import {useContext, useRef, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
// import {CanvasContext} from "../Context";
import Canvas from "./canvas";
import {getCanvas} from "../request/canvas";
import {ICanvasInstance} from "./canvas";

export function useCanvas(canvas?: any) {
  const canvasRef = useRef<ICanvasInstance>(null);

  if (!canvasRef.current) {
    if (canvas) {
      canvasRef.current = canvas;
    } else {
      const canvas = new Canvas();
      canvasRef.current = canvas.getPublicCanvas();
    }
  }

  return canvasRef.current;
}

// 获取画布唯一标识id
export function useCanvasId(): string | null {
  const [params] = useSearchParams();
  let id: string | null = params.get("id");

  return id;
}
