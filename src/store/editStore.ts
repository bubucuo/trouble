import {create} from "zustand";
import type {ICanvas, ICmp, _Style} from "./canvas";
import {getCanvas} from "../request/canvas";
import {cloneDeep, isFunction} from "lodash";
import {getOnlyKey} from "../utils";
import {immer} from "zustand/middleware/immer";
import produce from "immer";

export const dontRecordHistory = "dontRecordHistory";

export type Draft = any;
type SetDraftFC = (draft: Draft) => void;

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
  setCanvas: (
    _canvas: ICanvas | null | SetDraftFC,
    dontRecordHistory?: string
  ) => void;

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
  getSelectedCmp: () => ICmp | null;
  setSelectedCmpIndex: (index: number) => void;
  getSelectedCmpIndex: () => number;
  updateSelectedCmpStyle: (newStyle: _Style) => void;
  updateSelectedCmpValue: (newValue: string) => void;
  updateSelectedCmpStyleAndValue: (newStyle: _Style, newValue: string) => void;
  updateAssemblyCmps: (newStyle: _Style, dontRecordHistory?: string) => void;
  addAndUpdateAssembly: (indexes: Array<number>) => void;

  // ! 更新组件属性
  updateSelectedCmpAttr: (name: string, value: string) => void;

  // 判断下标为index的组件是否被批量选中
  belongingToAssembly: (index: number) => boolean;

  // 历史
  recordCanvasChangeHistory: (
    newHistoryItem: ICanvas,
    otherState?: Object
  ) => void;
  goPrevCanvasHistory: () => void;
  goNextCanvasHistory: () => void;
  recordCanvasChangeHistoryAfterBatch: () => void;

  // ! 右键
  // 批量添加、删除组件
  addAssemblyCms: () => void;
  deleteCmps: () => void;

  // 层级
  addCmpZIndex: () => void;
  subCmpZIndex: () => void;
  topZIndex: () => void;
  bottomZIndex: () => void;

  //
};

export interface IEditStore extends EditStoreState, EditStoreAction {}

const maxCanvasChangeHistory = 100;
const useEditStore = create(
  immer<EditStoreState & EditStoreAction>((set, get) => ({
    canvas: getDefaultCanvas(),
    // 历史，初始值为空数组
    canvasChangeHistory: [getDefaultCanvas()],

    canvasChangeHistoryIndex: 0,
    assembly: new Set(),

    // 同步设置画布数据
    setCanvas: (
      _canvas: ICanvas | null | SetDraftFC,
      dontRecordHistory?: string
    ) => {
      const store = get() as IEditStore;

      let newStore: any;

      if (isFunction(_canvas)) {
        newStore = produce(store, _canvas);
      } else if (_canvas !== null && typeof _canvas === "object") {
        newStore = {canvas: _canvas};
      } else {
        newStore = {canvas: getDefaultCanvas()};
      }

      if (dontRecordHistory === undefined) {
        store.recordCanvasChangeHistory(newStore.canvas, newStore);
      } else {
        set(newStore);
      }
    },

    // 获取服务端数据，并渲染画布
    fetchCanvas: async (id: number) => {
      getCanvas(id, (res: any) => {
        if (res.content.length > 100) {
          set((draft) => {
            draft.canvas = JSON.parse(res.content);
            draft.canvasChangeHistory = [draft.canvas];
            draft.canvasChangeHistoryIndex = 0;
          });
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
        draft.canvas.style = {
          ...draft.style,
          ...newStyle,
        };
      };
      store.setCanvas(_canvas);
    },

    updateCanvasTitle: (title: string) => {
      const store = get() as IEditStore;

      const _canvas = (draft: Draft) => {
        draft.canvas.title = title;
      };
      store.setCanvas(_canvas);
    },

    // 新增组件
    addCmp: (_cmp: ICmp) => {
      const store = get() as IEditStore;

      const _canvas = (draft: Draft) => {
        draft.canvas.cmps.push({..._cmp, key: getOnlyKey()});
      };

      store.setCanvas(_canvas);
    },

    // ! 选中的组件
    getSelectedCmp: (): ICmp | null => {
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
        draft.canvas.cmps[store.getSelectedCmpIndex()].style = {
          ...selectedCmp?.style,
          ...newStyle,
        };
      };

      store.setCanvas(_canvas);
    },
    updateSelectedCmpValue: (newValue: string) => {
      const store = get() as IEditStore;
      const _canvas = (draft: Draft) => {
        draft.canvas.cmps[store.getSelectedCmpIndex()].value = newValue;
      };

      store.setCanvas(_canvas);
    },

    updateSelectedCmpStyleAndValue: (newStyle: _Style, newValue: string) => {
      const store = get() as IEditStore;
      const selectedCmp = store.getSelectedCmp();

      const _canvas = (draft: Draft) => {
        draft.canvas.cmps[store.getSelectedCmpIndex()].style = {
          ...selectedCmp?.style,
          ...newStyle,
        };

        draft.canvas.cmps[store.getSelectedCmpIndex()].value = newValue;
      };

      store.setCanvas(_canvas);
    },

    //dontRecordHistory标记频繁修改，此时不记录到历史记录里，只有up阶段才记录
    updateAssemblyCmps: (newStyle: _Style, dontRecordHistory) => {
      const store = get() as IEditStore;

      const _canvas = (draft: Draft) => {
        store.assembly.forEach((index) => {
          const cmp = draft.canvas.cmps[index];
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

      store.setCanvas(_canvas, dontRecordHistory);
    },

    addAndUpdateAssembly: (indexes: Array<number>) => {
      set((draft) => {
        draft.assembly = new Set([...draft.assembly, ...indexes]);
      });
    },

    updateSelectedCmpAttr: (name: string, value: string) => {
      const store = get() as IEditStore;

      const selectedIndex = store.getSelectedCmpIndex();

      const _canvas = (draft: Draft) => {
        draft.canvas.cmps[selectedIndex][name] = value;
      };

      store.setCanvas(_canvas);
    },

    // ! 判断下标为index的组件是否被批量选中
    belongingToAssembly: (index: number) => {
      const store = get() as IEditStore;
      return isFunction(store.assembly.has) && store.assembly.has(index);
    },

    // ! 历史

    recordCanvasChangeHistory: (newHistoryItem: ICanvas, otherState = {}) => {
      set((draft) => {
        Object.assign(draft, otherState);

        draft.canvasChangeHistory.push(newHistoryItem);
        draft.canvasChangeHistoryIndex++;

        if (draft.canvasChangeHistory.length > maxCanvasChangeHistory) {
          // 溢出最大宽度，那么删除第0个元素
          draft.canvasChangeHistory.shift();
          draft.canvasChangeHistoryIndex--;
        }
      });
    },

    recordCanvasChangeHistoryAfterBatch: () => {
      const store = get() as IEditStore;
      store.recordCanvasChangeHistory(store.canvas);
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

      set((draft) => {
        draft.canvas = draft.canvasChangeHistory[newIndex];
        draft.canvasChangeHistoryIndex = newIndex;
      });
    },

    goNextCanvasHistory: () => {
      const store = get() as IEditStore;

      let newIndex = store.canvasChangeHistoryIndex + 1;
      if (newIndex >= store.canvasChangeHistory.length) {
        newIndex = store.canvasChangeHistory.length - 1;
      }

      // 如果越界
      if (newIndex === store.canvasChangeHistory.length) {
        return;
      }

      set((draft) => {
        draft.canvas = draft.canvasChangeHistory[newIndex];
        draft.canvasChangeHistoryIndex = newIndex;
      });
    },

    // ! 右键
    // 批量添加、删除组件
    addAssemblyCms: () => {
      const store = get() as IEditStore;

      const newCmps: Array<ICmp> = [];
      const newAssembly = new Set();
      let i = store.canvas.cmps.length;

      store.assembly.forEach((index) => {
        const cmp = store.canvas.cmps[index];
        const newCmp = cloneDeep(cmp);
        newCmp.key = getOnlyKey();

        newCmp.style.top += 40;
        newCmp.style.left += 40;

        newCmps.push(newCmp);

        newAssembly.add(i++);
      });

      // 添加组件之后，更新选中的组件
      store.setCanvas((draft) => {
        draft.canvas.cmps = draft.canvas.cmps.concat(newCmps);
        draft.assembly = newAssembly;
      });
    },
    deleteCmps: () => {
      const store = get() as IEditStore;

      const sorted = Array.from(store.assembly).sort((a, b) => b - a);

      store.setCanvas((draft) => {
        sorted.forEach((index) => {
          draft.canvas.cmps.splice(index, 1);
        });
        draft.assembly.clear();
      });
    },

    // ! 单个元素的层级变化
    // 上移
    addCmpZIndex: () => {
      const store = get() as IEditStore;

      const cmps = store.canvas.cmps;
      const cmpIndex = store.getSelectedCmpIndex();

      if (cmpIndex === cmps.length - 1) {
        // 已经是最高层级
        return;
      }

      store.setCanvas((draft) => {
        [draft.canvas.cmps[cmpIndex], draft.canvas.cmps[cmpIndex + 1]] = [
          draft.canvas.cmps[cmpIndex + 1],
          draft.canvas.cmps[cmpIndex],
        ];

        draft.assembly = new Set([cmpIndex + 1]);
      });
    },

    // 0 1  3 2 4
    // 下移
    subCmpZIndex: () => {
      const store = get() as IEditStore;

      const cmps = store.canvas.cmps;
      const cmpIndex = store.getSelectedCmpIndex();

      if (cmpIndex === 0) {
        // 已经是最低层级
        return;
      }

      store.setCanvas((draft) => {
        [draft.canvas.cmps[cmpIndex], draft.canvas.cmps[cmpIndex - 1]] = [
          draft.canvas.cmps[cmpIndex - 1],
          draft.canvas.cmps[cmpIndex],
        ];

        draft.assembly = new Set([cmpIndex - 1]);
      });
    },

    // 0 1  3 4 2
    // 单个元素置顶
    topZIndex: () => {
      const store = get() as IEditStore;

      store.setCanvas((draft) => {
        const cmps = draft.canvas.cmps;
        const cmpIndex = store.getSelectedCmpIndex();

        draft.canvas.cmps = cmps
          .slice(0, cmpIndex)
          .concat(cmps.slice(cmpIndex + 1))
          .concat(cmps[cmpIndex]);

        draft.assembly = new Set([cmps.length - 1]);
      });
    },

    // 单个元素置底
    bottomZIndex: () => {
      const store = get() as IEditStore;

      store.setCanvas((draft) => {
        const cmps = draft.canvas.cmps;
        const cmpIndex = store.getSelectedCmpIndex();

        draft.canvas.cmps = [cmps[cmpIndex]]
          .concat(cmps.slice(0, cmpIndex))
          .concat(cmps.slice(cmpIndex + 1));

        draft.assembly = new Set([0]);
      });
    },
  }))
);

export default useEditStore;

function getDefaultCanvas(): ICanvas {
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
