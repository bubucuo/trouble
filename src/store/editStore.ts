import {create} from "zustand";
import type {
  Draft,
  IEditStore,
  EditStoreAction,
  EditStoreState,
  ICanvas,
  ICmp,
  _Style,
  SetDraftFC,
  ICmpWithKey,
} from "./editStoreTypes";
import {getCanvas} from "src/request/canvas";
import {cloneDeep, isFunction} from "lodash";
import {getOnlyKey} from "src/utils";
import {immer} from "zustand/middleware/immer";
import produce from "immer";

const maxCanvasChangeHistory = 100;
export const dontRecordHistory = "dontRecordHistory";

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
      const store = get();

      let newStore: any;

      if (isFunction(_canvas)) {
        newStore = produce(store, _canvas);
      } else if (_canvas !== null && typeof _canvas === "object") {
        newStore = {canvas: _canvas};
      } else {
        newStore = {canvas: getDefaultCanvas()};
      }

      if (dontRecordHistory === undefined) {
        // 和历史记录一起设置
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

    // ! 更新画布属性
    updateCanvasStyle: (newStyle: any) => {
      const store = get();

      const _canvas = (draft: Draft): any => {
        draft.canvas.style = {
          ...draft.style,
          ...newStyle,
        };
      };
      store.setCanvas(_canvas);
    },

    updateCanvasTitle: (title: string) => {
      const store = get();

      const _canvas = (draft: Draft) => {
        draft.canvas.title = title;
      };
      store.setCanvas(_canvas);
    },

    // 新增组件
    addCmp: (_cmp: ICmp) => {
      const store = get();

      const _canvas = (draft: Draft) => {
        draft.canvas.cmps.push({..._cmp, key: getOnlyKey()});
        draft.assembly = new Set([draft.canvas.cmps.length - 1]);
      };

      store.setCanvas(_canvas);
    },

    setSelectedCmpIndex: (index: number) => {
      const store = get();

      // 空的，再重新设置，不要引起渲染
      if (store.assembly.size === 0 && index === -1) {
        return;
      }

      // 和上次值相同
      if (index > -1 && selectedCmpIndexSelector(store) === index) {
        return;
      }

      if (index === -1) {
        set((draft) => {
          draft.assembly.clear();
        });
      } else {
        set((draft) => {
          draft.assembly = new Set([index]);
        });
      }
    },

    updateSelectedCmpStyle: (newStyle: _Style) => {
      const store = get();
      const selectedCmp = selectedCmpSelector(store);

      const _canvas = (draft: Draft) => {
        draft.canvas.cmps[selectedCmpIndexSelector(store)].style = {
          ...selectedCmp?.style,
          ...newStyle,
        };
      };

      store.setCanvas(_canvas);
    },
    updateSelectedCmpValue: (newValue: string) => {
      const store = get();
      const _canvas = (draft: Draft) => {
        draft.canvas.cmps[selectedCmpIndexSelector(store)].value = newValue;
      };

      store.setCanvas(_canvas);
    },

    updateSelectedCmpStyleAndValue: (newStyle: _Style, newValue: string) => {
      const store = get();
      const selectedCmp = selectedCmpSelector(store);

      const selectedIndex = selectedCmpIndexSelector(store);
      const _canvas = (draft: Draft) => {
        draft.canvas.cmps[selectedIndex].style = {
          ...selectedCmp?.style,
          ...newStyle,
        };

        draft.canvas.cmps[selectedIndex].value = newValue;
      };

      store.setCanvas(_canvas);
    },

    //dontRecordHistory标记频繁修改，此时不记录到历史记录里，只有up阶段才记录
    updateAssemblyCmps: (newStyle: _Style, dontRecordHistory) => {
      const store = get();

      const _canvas = (draft: Draft) => {
        store.assembly.forEach((index) => {
          const cmp = draft.canvas.cmps[index];
          for (const key in newStyle) {
            cmp.style[key] += newStyle[key];
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
      const store = get();

      const selectedIndex = selectedCmpIndexSelector(store);

      const _canvas = (draft: Draft) => {
        draft.canvas.cmps[selectedIndex][name] = value;
      };

      store.setCanvas(_canvas);
    },

    // ! 判断下标为index的组件是否被批量选中
    belongingToAssembly: (index: number) => {
      const store = get();
      return isFunction(store.assembly.has) && store.assembly.has(index);
    },

    // ! 历史
    recordCanvasChangeHistory: (newHistoryItem: ICanvas, otherState = {}) => {
      set((draft) => {
        Object.assign(draft, otherState);
        // 在撤销回退过程中，此时历史下标为currentIndex，如果此时用户又去修改画布或者组件属性，
        // 重新插入了新的历史进来，那么把currentIndex之后的记录全部删除，再把新的画布数据插入进来。
        const canvasChangeHistory = draft.canvasChangeHistory;

        draft.canvasChangeHistory = canvasChangeHistory.slice(
          0,
          draft.canvasChangeHistoryIndex + 1
        );

        draft.canvasChangeHistory.push(cloneDeep(newHistoryItem));
        draft.canvasChangeHistoryIndex++;

        if (draft.canvasChangeHistory.length > maxCanvasChangeHistory) {
          // 溢出最大宽度，那么删除第0个元素
          draft.canvasChangeHistory.shift();
          draft.canvasChangeHistoryIndex--;
        }
      });
    },

    recordCanvasChangeHistoryAfterBatch: () => {
      const store = get();
      store.recordCanvasChangeHistory(store.canvas);
    },

    goPrevCanvasHistory: () => {
      const store = get();

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
      const store = get();

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
    addAssemblyCmp: () => {
      const store = get();

      const newCmps: Array<ICmpWithKey> = [];
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
      const store = get();

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
      const store = get();

      const cmps = store.canvas.cmps;
      const cmpIndex = selectedCmpIndexSelector(store);

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
      const store = get();

      const cmpIndex = selectedCmpIndexSelector(store);

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
      const store = get();

      store.setCanvas((draft) => {
        const cmps = draft.canvas.cmps;
        const cmpIndex = selectedCmpIndexSelector(store);

        draft.canvas.cmps = cmps
          .slice(0, cmpIndex)
          .concat(cmps.slice(cmpIndex + 1))
          .concat(cmps[cmpIndex]);

        draft.assembly = new Set([cmps.length - 1]);
      });
    },

    // 单个元素置底
    bottomZIndex: () => {
      const store = get();

      store.setCanvas((draft) => {
        const cmps = draft.canvas.cmps;
        const cmpIndex = selectedCmpIndexSelector(store);

        draft.canvas.cmps = [cmps[cmpIndex]]
          .concat(cmps.slice(0, cmpIndex))
          .concat(cmps.slice(cmpIndex + 1));

        draft.assembly = new Set([0]);
      });
    },
  }))
);

export default useEditStore;

export const canvasSelector = (store: IEditStore): ICanvas => store.canvas;
export const cmpsSelector = (store: IEditStore): Array<ICmpWithKey> =>
  store.canvas.cmps;

export const selectedCmpSelector = (store: IEditStore): ICmpWithKey | null => {
  const cmps = cmpsSelector(store);
  const selectedIndex = selectedCmpIndexSelector(store);
  return selectedIndex > -1 ? cmps[selectedIndex] : null;
};

export const selectedCmpIndexSelector = (store: IEditStore): number => {
  const selectedCmpIndex = Array.from(store.assembly)[0];
  return selectedCmpIndex === undefined ? -1 : selectedCmpIndex;
};

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
