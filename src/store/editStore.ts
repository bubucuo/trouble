import {create} from "zustand";
import type {ICanvas, ICmp, _Style} from "./canvas";
import {getCanvas} from "../request/canvas";
import {cloneDeep, isFunction} from "lodash";
import {getOnlyKey} from "../utils";
import {immer} from "zustand/middleware/immer";

export type EditStoreState = {
  // 画布数据
  canvas: ICanvas;
  // 编辑历史
  canvasChangeHistory: Array<ICanvas>;
  // 当前历史下标记
  canvasChangeHistoryIndex: number;
  // 选中的组件的下标 Set
  assembly: Set<number>;
};

export type EditStoreAction = {
  // 同步设置画布数据
  setCanvas: (_canvas: ICanvas, dontRecordHistory?: string) => void;

  // 获取服务端数据，并渲染画布
  fetchCanvas: (id: number) => void;

  // ? 获取画布组件数据
  getCanvasCmps: () => Array<ICmp>;

  // ! 更新画布属性
  updateCanvasStyle: (newStyle: any) => void;
  updateCanvasTitle: (title: string) => void;

  // 添加组件
  addCmp: (_cmp: ICmp) => void;

  // 选中的组件
  getSelectedCmp: () => ICmp;
  setSelectedCmpIndex: (index: number) => void;
  getSelectedCmpIndex: () => number;
  updateSelectedCmpStyle: (newStyle: _Style) => void;
  updateSelectedCmpValue: (newValue: string) => void;
  updateSelectedCmpStyleAndValue: (newStyle: _Style, newValue: string) => void;
  updateAssemblyCmps: (newStyle: _Style) => void;
  addAndUpdateAssembly: (indexes: Array<string>) => void;

  // ! 更新组件属性
  updateSelectedCmpAttr: (name: string, value: string) => void;

  // 判断下标为index的组件是否被批量选中
  belongingToAssembly: (index: number) => boolean;

  // 历史
  recordCanvasChangeHistory: () => void;
  goPrevCanvasHistory: () => void;
  goNextCanvasHistory: () => void;

  // 层级
  addCmpZIndex: () => void;
  subCmpZIndex: () => void;
  topZIndex: () => void;
  bottomZIndex: () => void;
};

export type Draft = any;

// todo https://docs.pmnd.rs/zustand/integrations/immer-middleware
export interface IEditStore {
  // 画布数据
  canvas: ICanvas;
  // 编辑历史
  canvasChangeHistory: Array<ICanvas>;
  // 当前历史下标记
  canvasChangeHistoryIndex: number;
  // 选中的组件的下标 Set
  assembly: Set<number>;

  // 同步设置画布数据
  setCanvas: (_canvas: ICanvas, dontRecordHistory?: string) => void;

  // 获取服务端数据，并渲染画布
  fetchCanvas: (id: number) => void;

  // ? 获取画布组件数据
  getCanvasCmps: () => Array<ICmp>;

  // ! 更新画布属性
  updateCanvasStyle: (newStyle: any) => void;
  updateCanvasTitle: (title: string) => void;

  // 添加组件
  addCmp: (_cmp: ICmp) => void;

  // 选中的组件
  getSelectedCmp: () => ICmp;
  setSelectedCmpIndex: (index: number) => void;
  getSelectedCmpIndex: () => number;
  updateSelectedCmpStyle: (newStyle: _Style) => void;
  updateSelectedCmpValue: (newValue: string) => void;
  updateSelectedCmpStyleAndValue: (newStyle: _Style, newValue: string) => void;
  updateAssemblyCmps: (newStyle: _Style) => void;
  addAndUpdateAssembly: (indexes: Array<string>) => void;

  // ! 更新组件属性
  updateSelectedCmpAttr: (name: string, value: string) => void;

  // 判断下标为index的组件是否被批量选中
  belongingToAssembly: (index: number) => boolean;

  // 历史
  recordCanvasChangeHistory: () => void;
  goPrevCanvasHistory: () => void;
  goNextCanvasHistory: () => void;

  // 层级
  addCmpZIndex: () => void;
  subCmpZIndex: () => void;
  topZIndex: () => void;
  bottomZIndex: () => void;
}

const maxCanvasChangeHistory = 100;
const useEditStore = create(
  // immer<EditStoreState & EditStoreAction>((set, get) => ({
  immer<IEditStore>((set, get) => ({
    canvas: getDefaultCanvas(),
    // 历史
    canvasChangeHistory: [getDefaultCanvas()],

    canvasChangeHistoryIndex: 0,
    assembly: new Set(),

    // 同步设置画布数据
    setCanvas: (
      _canvas: ICanvas | null | Function,
      dontRecordHistory?: string
    ) => {
      const store = get() as IEditStore;

      if (isFunction(_canvas)) {
        set(_canvas);
      } else {
        set({canvas: _canvas || getDefaultCanvas()});
      }

      if (dontRecordHistory === undefined) {
        store.recordCanvasChangeHistory();
      }
    },

    // 获取服务端数据，并渲染画布
    fetchCanvas: async (id: number) => {
      const store = get() as IEditStore;

      getCanvas(id, (res: any) => {
        if (res.content.length > 100) {
          store.setCanvas(JSON.parse(res.content));

          // set({
          //   canvas: JSON.parse(res.content),
          // });
        }
      });
    },

    // ? 获取画布组件数据
    getCanvasCmps: () => {
      const store = get() as IEditStore;

      return store.canvas.cmps;
    },

    // ! 更新画布属性
    updateCanvasStyle: (newStyle: any) => {
      const store = get() as IEditStore;

      const _canvas = (draft: Draft): any => {
        draft.style = {
          ...draft.style,
          ...newStyle,
        };
      };
      store.setCanvas(_canvas);
    },

    updateCanvasTitle: (title: string) => {
      const store = get() as IEditStore;

      const _canvas = (draft: Draft) => {
        draft.title = title;
      };
      store.setCanvas(_canvas);
    },

    // 新增组件
    addCmp: (_cmp: ICmp) => {
      const store = get() as IEditStore;

      const _canvas = (draft: Draft) => {
        draft.cmps.push({..._cmp, key: getOnlyKey()});
      };

      store.setCanvas(_canvas);
    },

    // ! 选中的组件
    getSelectedCmp: () => {
      const store = get() as IEditStore;

      const cmps = store.getCanvasCmps();

      const selectedIndex = store.getSelectedCmpIndex();
      return selectedIndex > -1 ? cmps[selectedIndex] : null;
    },

    setSelectedCmpIndex: (index: number) => {
      const store = get() as IEditStore;
      if (store.getSelectedCmpIndex() === index) {
        return;
      }

      set({assembly: new Set([index])});
    },

    getSelectedCmpIndex: () => {
      const store = get() as IEditStore;
      const selectedCmpIndex = Array.from(store.assembly)[0];
      return selectedCmpIndex === undefined ? -1 : selectedCmpIndex;
    },

    updateSelectedCmpStyle: (newStyle: _Style) => {
      const store = get() as IEditStore;
      const selectedCmp = store.getSelectedCmp();

      const _canvas = (draft: Draft) => {
        draft.cmps[store.getSelectedCmpIndex()].style = {
          ...selectedCmp?.style,
          ...newStyle,
        };
      };

      store.setCanvas(_canvas);
    },
    updateSelectedCmpValue: (newValue: string) => {
      const store = get() as IEditStore;
      const _canvas = (draft: Draft) => {
        draft.cmps[store.getSelectedCmpIndex()].value = newValue;
      };

      store.setCanvas(_canvas);
    },

    updateSelectedCmpStyleAndValue: (newStyle: _Style, newValue: string) => {
      const store = get() as IEditStore;
      const selectedCmp = store.getSelectedCmp();

      const _canvas = (draft: Draft) => {
        draft.cmps[store.getSelectedCmpIndex()].style = {
          ...selectedCmp?.style,
          ...newStyle,
        };

        draft.cmps[store.getSelectedCmpIndex()].value = newValue;
      };

      store.setCanvas(_canvas);
    },

    // todo
    updateAssemblyCmps: (newStyle: _Style) => {
      const store = get() as IEditStore;

      const _canvas = (draft: Draft) => {
        store.assembly.forEach((index) => {
          const cmp = draft.cmps[index];
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
      };

      store.setCanvas(_canvas, "dontRecordHistory");
    },

    addAndUpdateAssembly: (indexes: Array<number>) => {
      const store = get() as IEditStore;
      set({assembly: new Set([...store.assembly, ...indexes])});
    },

    updateSelectedCmpAttr: (name: string, value: string) => {
      const store = get() as IEditStore;

      const selectedIndex = store.getSelectedCmpIndex();

      const _canvas = (draft) => {
        draft.cmps[selectedIndex][name] = value;
      };

      store.setCanvas(_canvas);
    },

    // ! 判断下标为index的组件是否被批量选中
    belongingToAssembly: (index: number) => {
      const store = get() as IEditStore;
      return isFunction(store.assembly.has) && store.assembly.has(index);
    },

    // ! 历史
    recordCanvasChangeHistory: () => {
      const store = get() as IEditStore;

      let _canvasChangeHistoryIndex = store.canvasChangeHistoryIndex;

      let _canvasChangeHistory = (draft: Draft) => {
        draft.push(cloneDeep(store.canvas));
        _canvasChangeHistoryIndex++;
      };

      _canvasChangeHistory = _canvasChangeHistory.slice(
        0,
        _canvasChangeHistoryIndex + 1
      );

      // 最多记录100条
      if (_canvasChangeHistory.length > maxCanvasChangeHistory) {
        _canvasChangeHistory.shift();
        _canvasChangeHistoryIndex--;
      }

      set({
        canvasChangeHistory: _canvasChangeHistory,
        canvasChangeHistoryIndex: _canvasChangeHistoryIndex,
      });
    },

    goPrevCanvasHistory: () => {
      const store = get() as IEditStore;

      let newIndex = store.canvasChangeHistoryIndex - 1;
      if (newIndex < 0) {
        newIndex = 0;
      }

      if (store.canvasChangeHistoryIndex === newIndex) {
        return;
      }
      const newCanvas = cloneDeep(store.canvasChangeHistory[newIndex]);
      set({
        canvasChangeHistoryIndex: newIndex,
        canvas: newCanvas,
      });
    },

    goNextCanvasHistory: () => {
      const store = get() as IEditStore;

      let newIndex = store.canvasChangeHistoryIndex + 1;
      if (newIndex >= store.canvasChangeHistory.length) {
        newIndex = store.canvasChangeHistory.length - 1;
      }

      if (store.canvasChangeHistoryIndex === newIndex) {
        return;
      }

      const newCanvas = cloneDeep(store.canvasChangeHistory[newIndex]);

      set({
        canvasChangeHistoryIndex: newIndex,
        canvas: newCanvas,
      });
    },

    // ! 层级
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
  }))
);

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
