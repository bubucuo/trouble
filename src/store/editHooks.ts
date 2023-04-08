import {useEffect} from "react";
import {useCanvasId, useCanvas} from "./hooks";
import useEditStore from "./editStore";
import {isEqual} from "lodash";

// 通过网络请求获取画布数据
export function useFetchCanvas() {
  const id = useCanvasId();
  const editStore = useEditStore();

  useEffect(() => {
    if (id !== null) {
      editStore.fetchCanvas(id);
    }
  }, [id]);
}

export function useCanvasFromEditStore() {
  const editStore = useEditStore();
  return editStore.canvas;
}

export function useEditStoreCanvas() {
  const canvas = useEditStore((state) => state.canvas, isEqual);

  return canvas;
}

export function useSelectedCmp() {}
