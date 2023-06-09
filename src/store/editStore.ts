import {create} from "zustand";
import {immer} from "zustand/middleware/immer";
import type {
  EditStoreState,
  EditStoreAction,
  ICmp,
  Style,
  IEditStore,
  ICmpWithKey,
  IContent,
} from "./editStoreTypes";
import {getOnlyKey, isCmpInView} from "src/utils";
import Axios from "src/request/axios";
import {getCanvasByIdEnd, saveCanvasEnd} from "src/request/end";
import {resetZoom} from "./zoomStore";
import {recordCanvasChangeHistory} from "./historySlice";
import {cloneDeep} from "lodash";

const showDiff = 12;
const adjustDiff = 3;

const useEditStore = create(
  immer<EditStoreState & EditStoreAction>(() => ({
    canvas: {
      id: null,
      title: "未命名",
      type: "content",
      content: getDefaultCanvasContent(),
    },
    // 记录选中组件的下标
    assembly: new Set(),

    // 历史
    canvasChangeHistory: [
      {
        canvas: {
          id: null,
          title: "未命名",
          type: "content",
          content: getDefaultCanvasContent(),
        },
        assembly: new Set(),
      },
    ],
    canvasChangeHistoryIndex: 0,
  }))
);

export const clearCanvas = () => {
  useEditStore.setState((draft) => {
    draft.canvas.content = getDefaultCanvasContent();
    draft.assembly.clear();
    recordCanvasChangeHistory(draft);
  });

  resetZoom();
};

export const addCmp = (_cmp: ICmp) => {
  useEditStore.setState((draft) => {
    draft.canvas.content.cmps.push({..._cmp, key: getOnlyKey()});
    draft.assembly = new Set([draft.canvas.content.cmps.length - 1]);
    recordCanvasChangeHistory(draft);
  });
};

// ! 右键菜单
// 复制选中的单个或者多个组件
export const addAssemblyCmps = () => {
  useEditStore.setState((draft) => {
    const newCmps: Array<ICmpWithKey> = [];
    const cmps = draft.canvas.content.cmps;
    let newAssembly: Set<number> = new Set();
    let i = cmps.length;

    draft.assembly.forEach((index) => {
      const cmp = cmps[index];
      const newCmp = cloneDeep(cmp);
      newCmp.key = getOnlyKey();

      newCmp.style.top += 40;
      newCmp.style.left += 40;

      newCmps.push(newCmp);
      newAssembly.add(i++);
    });

    draft.canvas.content.cmps = draft.canvas.content.cmps.concat(newCmps);
    draft.assembly = newAssembly;
  });
};

//  删除选中的组件
export const delSelectedCmps = () => {
  useEditStore.setState((draft) => {
    const assembly = draft.assembly;
    draft.canvas.content.cmps = draft.canvas.content.cmps.filter(
      (_, index) => !assembly.has(index)
    );
    draft.assembly.clear();
    recordCanvasChangeHistory(draft);
  });
};

// isNew 标记是否为新增页面，如果是新增，则在保存后需要跳转一次路由
export const saveCanvas = async (
  successCallback: (id: number, isNew: boolean) => void
) => {
  const canvas = useEditStore.getState().canvas;
  let isNew = canvas.id == null;
  const res: any = await Axios.post(saveCanvasEnd, {
    id: canvas.id,
    type: canvas.type,
    title: canvas.title,
    content: JSON.stringify(canvas.content),
  });

  successCallback(res?.id, isNew);

  if (isNew) {
    useEditStore.setState((draft) => {
      draft.canvas.id = res.id;
    });
  }
};

// 选择模板，生成页面
export const addCanvasByTpl = (res: any) => {
  useEditStore.setState((draft) => {
    draft.canvas.content = JSON.parse(res.content);
    draft.canvas.title = res.title + " 副本";
    draft.canvas.type = "content";

    draft.assembly.clear();
    recordCanvasChangeHistory(draft);
  });
};

// 根据 id 获取数据，填充页面
// 这里与保存不同，保存需要提供 id 与 type
export const fetchCanvas = async (id: number) => {
  const res: any = await Axios.get(getCanvasByIdEnd + id);

  if (res) {
    useEditStore.setState((draft) => {
      draft.canvas.content = JSON.parse(res.content);
      draft.canvas.id = res.id;
      draft.canvas.title = res.title;
      draft.canvas.type = res.type;

      draft.assembly.clear();
      // 初始化历史数据
      draft.canvasChangeHistory = [
        {canvas: draft.canvas, assembly: draft.assembly},
      ];
      draft.canvasChangeHistoryIndex = 0;
    });

    resetZoom();
  }
};

// ! 选中组件
// 全部选中
export const setAllCmpsSelected = () => {
  useEditStore.setState((draft) => {
    let len = draft.canvas.content.cmps.length;
    draft.assembly = new Set(Array.from({length: len}, (a, b) => b));
  });
};

// 选中多个
// 如果再次点击已经选中的组件，则取消选中
export const setCmpsSelected = (indexes: Array<number>) => {
  useEditStore.setState((draft) => {
    if (indexes)
      indexes.forEach((index) => {
        if (draft.assembly.has(index)) {
          // 取消这个组件的选中
          draft.assembly.delete(index);
        } else {
          // 选中
          draft.assembly.add(index);
        }
      });
  });
};

// 选中单个
// 如果index为-1，则取消选中
export const setCmpSelected = (index: number) => {
  if (index === -1) {
    useEditStore.setState((draft) => {
      if (draft.assembly.size > 0) {
        draft.assembly.clear();
      }
    });
  } else if (index > -1) {
    useEditStore.setState((draft) => {
      draft.assembly = new Set([index]);
    });
  }
};

// ! 修改组件属性
// 根据改变的量来修改
export const updateAssemblyCmpsByDistance = (
  newStyle: Style,
  autoAdjustment?: boolean
) => {
  useEditStore.setState((draft) => {
    draft.assembly.forEach((index) => {
      const selectedCmp = {...draft.canvas.content.cmps[index]};

      let invalid = false;
      for (const key in newStyle) {
        if (
          (key === "width" || key === "height") &&
          selectedCmp.style[key] + newStyle[key] < 2
        ) {
          invalid = true;
          break;
        }
        selectedCmp.style[key] += newStyle[key];
      }

      // 检查自动调整
      if (draft.assembly.size === 1 && autoAdjustment) {
        // 对齐画布或者组件
        // 画布
        autoAlignToCanvas(canvasStyleSelector(draft), selectedCmp);

        // 对齐单个组件
        // 这个时候画布和组件会相互影响。一般产品会做一个取舍，对齐画布还是组件
        const cmps = cmpsSelector(draft);
        cmps.forEach((cmp, cmpIndex) => {
          // 如果组件不在可视区，这个时候用户看不到，也就不用对齐
          const inView = isCmpInView(cmp);
          if (cmpIndex !== index && inView) {
            autoAlignToCmp(cmp.style, selectedCmp);
          }
        });
      }

      if (!invalid) {
        draft.canvas.content.cmps[index] = selectedCmp;
      }
    });
  });
};

// 对齐画布
function autoAlignToCanvas(targetStyle: Style, selectedCmp: ICmpWithKey) {
  const selectedCmpStyle = selectedCmp.style;

  // ! 中心 X 轴
  autoAlign(
    selectedCmpStyle.top + selectedCmpStyle.height / 2 - targetStyle.height / 2,
    "centerXLine",
    () => {
      selectedCmp.style.top =
        (targetStyle.height - selectedCmpStyle.height) / 2;
    }
  );

  // ! 中心 Y 轴
  autoAlign(
    selectedCmpStyle.left + selectedCmpStyle.width / 2 - targetStyle.width / 2,
    "centerYLine",
    () => {
      selectedCmp.style.left = (targetStyle.width - selectedCmpStyle.width) / 2;
    }
  );

  // ! 对齐画布 top
  autoAlign(selectedCmpStyle.top, "canvasLineTop", () => {
    selectedCmp.style.top = 0;
  });

  // ! 对齐画布 bottom
  autoAlign(
    selectedCmpStyle.top + selectedCmpStyle.height - targetStyle.height,
    "canvasLineBottom",
    () => {
      selectedCmp.style.top = targetStyle.height - selectedCmpStyle.height;
    }
  );

  // ! 对齐画布 left
  autoAlign(selectedCmpStyle.left, "canvasLineLeft", () => {
    selectedCmp.style.left = 0;
  });

  // ! 对齐画布 right
  autoAlign(
    selectedCmpStyle.left + selectedCmpStyle.width - targetStyle.width,
    "canvasLineRight",
    () => {
      selectedCmp.style.left = targetStyle.width - selectedCmpStyle.width;
    }
  );
}

function autoAlign(
  _distance: number,
  domLineId: string,
  align: () => void,
  adjustDomLine?: (domLine: HTMLElement) => void
) {
  const distance = Math.abs(_distance);
  const domLine = document.getElementById(domLineId) as HTMLElement;
  if (distance < showDiff) {
    // 显示参考线
    domLine.style.display = "block";
    if (adjustDomLine) {
      adjustDomLine(domLine);
    }
  }
  if (distance < adjustDiff) {
    // 自动吸附
    align();
  }
}

// 对齐其它组件
// 对齐组件的时候，对齐线从两个组件的中心出发，这样可以看出来对齐的是哪两个组件
function autoAlignToCmp(targetStyle: Style, selectedCmp: ICmpWithKey) {
  const selectedCmpStyle = selectedCmp.style;

  let leftStyle: Style, rightStyle: Style;
  if (targetStyle.left < selectedCmpStyle.left) {
    leftStyle = targetStyle;
    rightStyle = selectedCmpStyle;
  } else {
    leftStyle = selectedCmpStyle;
    rightStyle = targetStyle;
  }

  let topStyle: Style, bottomStyle: Style;
  if (targetStyle.top < selectedCmpStyle.top) {
    topStyle = targetStyle;
    bottomStyle = selectedCmpStyle;
  } else {
    topStyle = selectedCmpStyle;
    bottomStyle = targetStyle;
  }

  // ! top top 对齐
  autoAlign(
    targetStyle.top - selectedCmpStyle.top,
    "lineTop",
    () => {
      selectedCmp.style.top = targetStyle.top;
    },
    (domLine) => {
      domLine.style.top = targetStyle.top + "px";
      domLine.style.left = leftStyle.left + leftStyle.width / 2 + "px";
      domLine.style.width =
        rightStyle.left +
        rightStyle.width / 2 -
        leftStyle.left -
        leftStyle.width / 2 +
        "px";
    }
  );

  // ! bottom top 对齐
  autoAlign(
    targetStyle.top + targetStyle.height - selectedCmpStyle.top,
    "lineTop",
    () => {
      selectedCmp.style.top = targetStyle.top + targetStyle.height;
    },
    (domLine) => {
      domLine.style.top = targetStyle.top + targetStyle.height + "px";
      domLine.style.left = leftStyle.left + leftStyle.width / 2 + "px";
      domLine.style.width =
        rightStyle.left +
        rightStyle.width / 2 -
        leftStyle.left -
        leftStyle.width / 2 +
        "px";
    }
  );

  // ! bottom bottom 对齐
  autoAlign(
    targetStyle.top +
      targetStyle.height -
      selectedCmpStyle.top -
      selectedCmpStyle.height,
    "lineBottom",
    () => {
      selectedCmp.style.top =
        targetStyle.top + targetStyle.height - selectedCmpStyle.height;
    },
    (domLine) => {
      domLine.style.top = targetStyle.top + targetStyle.height + "px";
      domLine.style.left = leftStyle.left + leftStyle.width / 2 + "px";
      domLine.style.width =
        rightStyle.left +
        rightStyle.width / 2 -
        leftStyle.left -
        leftStyle.width / 2 +
        "px";
    }
  );

  // ! top bottom  对齐
  autoAlign(
    targetStyle.top - selectedCmpStyle.top - selectedCmpStyle.height,
    "lineBottom",
    () => {
      selectedCmp.style.top = targetStyle.top - selectedCmpStyle.height;
    },
    (domLine) => {
      domLine.style.top = targetStyle.top + "px";
      domLine.style.left = leftStyle.left + leftStyle.width / 2 + "px";
      domLine.style.width =
        rightStyle.left +
        rightStyle.width / 2 -
        leftStyle.left -
        leftStyle.width / 2 +
        "px";
    }
  );

  // ! left left 对齐
  autoAlign(
    targetStyle.left - selectedCmpStyle.left,
    "lineLeft",
    () => {
      selectedCmp.style.left = targetStyle.left;
    },
    (domLine) => {
      domLine.style.top = topStyle.top + +topStyle.height / 2 + "px";
      domLine.style.left = targetStyle.left + "px";
      domLine.style.height =
        bottomStyle.top +
        bottomStyle.height / 2 -
        topStyle.top -
        topStyle.height / 2 +
        "px";
    }
  );

  // ! right left 对齐
  autoAlign(
    targetStyle.left - selectedCmpStyle.left - selectedCmpStyle.width,
    "lineLeft",
    () => {
      selectedCmp.style.left = targetStyle.left - selectedCmpStyle.width;
    },
    (domLine) => {
      domLine.style.left = targetStyle.left + "px";
      domLine.style.top = topStyle.top + topStyle.height / 2 + "px";
      domLine.style.height =
        bottomStyle.top +
        bottomStyle.height / 2 -
        topStyle.top -
        topStyle.height / 2 +
        "px";
    }
  );

  // ! right right 对齐
  autoAlign(
    targetStyle.left +
      targetStyle.width -
      selectedCmpStyle.left -
      selectedCmpStyle.width,
    "lineRight",
    () => {
      selectedCmp.style.left =
        targetStyle.left + targetStyle.width - selectedCmpStyle.width;
    },
    (domLine) => {
      domLine.style.left = targetStyle.left + targetStyle.width + "px";
      domLine.style.top = topStyle.top + topStyle.height / 2 + "px";
      domLine.style.height =
        bottomStyle.top +
        bottomStyle.height / 2 -
        topStyle.top -
        topStyle.height / 2 +
        "px";
    }
  );

  // ! left right  对齐
  autoAlign(
    targetStyle.left + targetStyle.width - selectedCmpStyle.left,
    "lineRight",
    () => {
      selectedCmp.style.left = targetStyle.left + targetStyle.width;
    },
    (domLine) => {
      domLine.style.left = targetStyle.left + targetStyle.width + "px";
      domLine.style.top = topStyle.top + topStyle.height / 2 + "px";
      domLine.style.height =
        bottomStyle.top +
        bottomStyle.height / 2 -
        topStyle.top -
        topStyle.height / 2 +
        "px";
    }
  );

  // ! 组件的中心 X 轴
  autoAlign(
    selectedCmpStyle.top +
      selectedCmpStyle.height / 2 -
      targetStyle.top -
      targetStyle.height / 2,
    "lineX",
    () => {
      selectedCmp.style.top =
        targetStyle.top + targetStyle.height / 2 - selectedCmpStyle.height / 2;
    },
    (domLine) => {
      domLine.style.top = targetStyle.top + targetStyle.height / 2 + "px";
      domLine.style.left = leftStyle.left + "px";
      domLine.style.width =
        rightStyle.left + rightStyle.width - leftStyle.left + "px";
    }
  );

  // ! 组件的中心 Y 轴
  autoAlign(
    selectedCmpStyle.left +
      selectedCmpStyle.width / 2 -
      targetStyle.left -
      targetStyle.width / 2,
    "lineY",
    () => {
      selectedCmp.style.left =
        targetStyle.left + targetStyle.width / 2 - selectedCmpStyle.width / 2;
    },
    (domLine) => {
      domLine.style.left = targetStyle.left + targetStyle.width / 2 + "px";

      domLine.style.top = topStyle.top + "px";
      domLine.style.height =
        bottomStyle.top + bottomStyle.height - topStyle.top + "px";
    }
  );
}

export const recordCanvasChangeHistory_2 = () => {
  const store = useEditStore.getState();
  if (
    store.canvas ===
    store.canvasChangeHistory[store.canvasChangeHistoryIndex].canvas
  ) {
    return;
  }

  useEditStore.setState((draft) => {
    recordCanvasChangeHistory(draft);
  });
};

// 修改画布 title
export const updateCanvasTitle = (title: string) => {
  useEditStore.setState((draft) => {
    draft.canvas.title = title;
    recordCanvasChangeHistory(draft);
  });
};

// ! 更新画布属性
export const updateCanvasStyle = (_style: any) => {
  useEditStore.setState((draft) => {
    Object.assign(draft.canvas.content.style, _style);
    recordCanvasChangeHistory(draft);
  });
};

// 修改单个组件的style
export const updateSelectedCmpStyle = (
  newStyle: Style,
  recordHistory: boolean | undefined = true
) => {
  useEditStore.setState((draft) => {
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (!(typeof selectedIndex === "number" && selectedIndex > -1)) {
      return;
    }
    Object.assign(draft.canvas.content.cmps[selectedIndex].style, newStyle);
    if (recordHistory) {
      recordCanvasChangeHistory(draft);
    }
  });
};

// 修改单个组件的属性
export const updateSelectedCmpAttr = (name: string, value: string) => {
  useEditStore.setState((draft: any) => {
    const selectedIndex = selectedCmpIndexSelector(draft);
    draft.canvas.content.cmps[selectedIndex][name] = value;
    recordCanvasChangeHistory(draft);
  });
};

// 修改选中组件的style
export const editAssemblyStyle = (_style: Style) => {
  useEditStore.setState((draft) => {
    draft.assembly.forEach((index: number) => {
      const _s = {...draft.canvas.content.cmps[index].style};
      const canvasStyle = draft.canvas.content.style;
      if (_style.right === 0) {
        // 计算left
        _s.left = canvasStyle.width - _s.width;
      } else if (_style.bottom === 0) {
        // top
        _s.top = canvasStyle.height - _s.height;
      } else if (_style.left === "center") {
        _s.left = (canvasStyle.width - _s.width) / 2;
      } else if (_style.top === "center") {
        _s.top = (canvasStyle.height - _s.height) / 2;
      } else {
        Object.assign(_s, _style);
      }

      draft.canvas.content.cmps[index].style = _s;

      recordCanvasChangeHistory(draft);
    });
  });
};

// ! 单个组件修改层级
// 置顶，把组件放到数组最后
// 0 1  3 4 2
export const topZIndex = () => {
  useEditStore.setState((draft) => {
    const cmps = draft.canvas.content.cmps;
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (selectedIndex === cmps.length - 1) {
      return;
    }
    draft.canvas.content.cmps = cmps
      .slice(0, selectedIndex)
      .concat(cmps.slice(selectedIndex + 1))
      .concat(cmps[selectedIndex]);

    draft.assembly = new Set([cmps.length - 1]);

    recordCanvasChangeHistory(draft);
  });
};

// 置底，把组件放到数组最后
// 0 1 2 3 4
export const bottomZIndex = () => {
  useEditStore.setState((draft) => {
    const cmps = draft.canvas.content.cmps;
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (selectedIndex === 0) {
      return;
    }
    draft.canvas.content.cmps = [cmps[selectedIndex]]
      .concat(cmps.slice(0, selectedIndex))
      .concat(cmps.slice(selectedIndex + 1));

    draft.assembly = new Set([0]);

    recordCanvasChangeHistory(draft);
  });
};

// 上移一个层级，和后一个元素交换
// 0 1 3 2 4
export const addZIndex = () => {
  useEditStore.setState((draft) => {
    const cmps = draft.canvas.content.cmps;
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (selectedIndex === cmps.length - 1) {
      return;
    }
    [
      draft.canvas.content.cmps[selectedIndex],
      draft.canvas.content.cmps[selectedIndex + 1],
    ] = [
      draft.canvas.content.cmps[selectedIndex + 1],
      draft.canvas.content.cmps[selectedIndex],
    ];

    draft.assembly = new Set([selectedIndex + 1]);

    recordCanvasChangeHistory(draft);
  });
};

// 下移一个层级，和前一个元素交换
export const subZIndex = () => {
  useEditStore.setState((draft) => {
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (selectedIndex === 0) {
      return;
    }
    [
      draft.canvas.content.cmps[selectedIndex],
      draft.canvas.content.cmps[selectedIndex - 1],
    ] = [
      draft.canvas.content.cmps[selectedIndex - 1],
      draft.canvas.content.cmps[selectedIndex],
    ];

    draft.assembly = new Set([selectedIndex - 1]);

    recordCanvasChangeHistory(draft);
  });
};

export default useEditStore;

// 选中的单个组件的index
export const selectedCmpIndexSelector = (store: IEditStore): number => {
  const selectedCmpIndex = Array.from(store.assembly)[0];
  return selectedCmpIndex === undefined ? -1 : selectedCmpIndex;
};

export const cmpsSelector = (store: IEditStore): Array<ICmpWithKey> => {
  return store.canvas.content.cmps;
};

export const canvasStyleSelector = (store: IEditStore): Style => {
  return store.canvas.content.style;
};

function getDefaultCanvasContent(): IContent {
  return {
    // 页面样式
    style: {
      width: 320,
      height: 568,
      backgroundColor: "#ffffff",
      backgroundImage: "",
      backgroundPosition: "center",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    },
    // 组件
    cmps: [],
  };
}
