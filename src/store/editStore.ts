import {create} from "zustand";
import type {ICanvas, ICmp, _Style} from "./canvas";
import {getCanvas} from "../request/canvas";

export interface IEditStore {
  canvas: ICanvas;
  canvasChangeHistory: [];
  canvasChangeHistoryIndex: number;
  assembly: Set<number>;

  fetchCanvas: (id: number) => void;
  setCanvas: (_canvas: ICanvas) => void;
  getCanvasCmps: () => Array<ICmp>;

  getCanvasComponents: () => Array<ICmp>;

  // 选中的组件
  getSelectedCmp: () => ICmp;
  setSelectedCmpIndex: (index: number) => void;
  getSelectedCmpIndex: () => number;
  updateSelectedCmp: () => void;
  updateAssemblyCmps: (newStyle: _Style) => void;

  // 历史
  recordCanvasChangeHistory: () => void;

  // 层级
  addCmpZIndex: () => void;
  subCmpZIndex: () => void;
  topZIndex: () => void;
  bottomZIndex: () => void;
}

const maxCanvasChangeHistory = 100;
const useEditStore = create((set, get) => ({
  canvas: getDefaultCanvas(),
  // 历史
  canvasChangeHistory: getDefaultCanvas(),

  canvasChangeHistoryIndex: 0,
  assembly: new Set(),

  // 异步获取数据
  fetchCanvas: async (id: number) => {
    getCanvas(id, (res: any) => {
      if (res.content.length > 100) {
        set({
          canvas: JSON.parse(res.content),
        });
      }
    });
  },

  setCanvas: (_canvas: ICanvas) => set({canvas: _canvas}),

  getCanvasCmps: () => {
    const store = get() as IEditStore;

    return store.canvas.cmps;
  },
  getSelectedCmpIndex: () => {
    const store = get() as IEditStore;
    const selectedCmpIndex = Array.from(store.assembly)[0];
    return selectedCmpIndex === undefined ? -1 : selectedCmpIndex;
  },

  getSelectedCmp: () => {
    const store = get() as IEditStore;

    const cmps = store.getCanvasComponents();

    const selectedIndex = store.getSelectedCmpIndex();
    return selectedIndex > -1 ? cmps[selectedIndex] : null;
  },

  getCanvasComponents: () => {
    const store = get() as IEditStore;
    return [...store.canvas.cmps];
  },

  // todo
  updateAssemblyCmps: (newStyle: _Style) => {
    const store = get() as IEditStore;
    store.assembly.forEach((index) => {
      const cmp = store.canvas.cmps[index];
      for (const key in newStyle) {
        cmp.style[key] += newStyle[key] - 0;

        if (cmp.style.width < 10) {
          cmp.style.width = 10;
        }
        if (cmp.style.height < 10) {
          cmp.style.height = 10;
        }
      }
    });
  },
  recordCanvasChangeHistory: () => {},
  updateSelectedCmp: (newStyle: _Style, newValue?: string | undefined) => {
    const store = get() as IEditStore;

    const selectedCmp = store.getSelectedCmp();

    const _canvas = store.canvas;

    if (newStyle) {
      _canvas.cmps[store.getSelectedCmpIndex()].style = {
        ...selectedCmp?.style,
        ...newStyle,
      };
    }

    if (newValue !== undefined) {
      _canvas.cmps[store.getSelectedCmpIndex()].value = newValue;
    }

    set({canvas: _canvas});
  },

  setSelectedCmpIndex: (index: number) => {
    const store = get() as IEditStore;
    if (store.getSelectedCmpIndex() === index) {
      return;
    }

    set({assembly: [...store.assembly, index]});
  },

  // 0 1  3 2 4
  // 上移
  addCmpZIndex: () => {
    const store = get() as IEditStore;

    const cmps = store.getCanvasCmps();

    const cmpIndex = store.getSelectedCmpIndex();
    const targetIndex = cmpIndex + 1;
    if (targetIndex >= cmps.length) {
      return;
    }

    const tem = cmps[cmpIndex];
    store.canvas.cmps[cmpIndex] = store.canvas.cmps[targetIndex];
    store.canvas.cmps[targetIndex] = tem;

    store.setSelectedCmpIndex(targetIndex);

    store.recordCanvasChangeHistory();
  },

  // 0 1  3 2 4
  // 下移
  subCmpZIndex: () => {
    const store = get() as IEditStore;

    const cmpIndex = store.getSelectedCmpIndex();
    const cmps = store.getCanvasCmps();
    const targetIndex = cmpIndex - 1;
    if (targetIndex < 0) {
      return;
    }

    const tem = cmps[cmpIndex];
    store.canvas.cmps[cmpIndex] = store.canvas.cmps[targetIndex];
    store.canvas.cmps[targetIndex] = tem;

    store.setSelectedCmpIndex(targetIndex);

    store.recordCanvasChangeHistory();
  },

  // 0 1  3 4 2
  // 置顶
  topZIndex: () => {
    const store = get() as IEditStore;

    const cmps = store.getCanvasCmps();
    const cmpIndex = store.getSelectedCmpIndex();
    if (cmpIndex >= cmps.length - 1) {
      return;
    }
    store.canvas.cmps = cmps
      .slice(0, cmpIndex)
      .concat(cmps.slice(cmpIndex + 1))
      .concat(cmps[cmpIndex]);

    store.setSelectedCmpIndex(cmps.length - 1);

    store.recordCanvasChangeHistory();
  },

  // 置底部
  bottomZIndex: () => {
    const store = get() as IEditStore;

    const cmps = store.getCanvasCmps();
    const cmpIndex = store.getSelectedCmpIndex();

    if (cmpIndex <= 0) {
      return;
    }

    store.canvas.cmps = [cmps[cmpIndex]]
      .concat(cmps.slice(0, cmpIndex))
      .concat(cmps.slice(cmpIndex + 1));

    store.setSelectedCmpIndex(0);

    store.recordCanvasChangeHistory();
  },

  // removeAllBears: () => set({bears: 0}),
}));

export default useEditStore;

function getDefaultCanvas() {
  return {
    title: "未命名",
    // 页面样式
    style: {
      width: 320,
      height: 568,
      backgroundColor: "#ffffff",
      backgroundImage: "",
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      // boxSizing: "content-box",
    },
    // 组件
    cmps: [],
  };
}
