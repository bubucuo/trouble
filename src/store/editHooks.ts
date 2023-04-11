import {useEffect} from "react";
import {useCanvasId} from "./hooks";
import useEditStore, {IEditStore} from "./editStore";
import {isEqual} from "lodash";

// 通过网络请求获取画布数据
export function useFetchCanvas() {
  const id = useCanvasId();
  const editStore = useEditStore() as IEditStore;

  useEffect(() => {
    if (id !== null) {
      editStore.fetchCanvas(id);
    }
  }, [id]);
}

export function useCanvasFromEditStore() {
  const editStore = useEditStore() as IEditStore;
  return editStore.canvas;
}

export function useEditStoreCanvas() {
  const canvas = useEditStore((state) => state.canvas, isEqual);
  return canvas;
}

export function useAssemblyFromEditStore() {
  const assembly = useEditStore((state) => state.assembly, isEqual);
  return assembly;
}

export function useSelectedCmp() {}
