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
import {computeBoxStyle, getOnlyKey, isCmpInView} from "src/utils";
import Axios from "src/request/axios";
import {getCanvasByIdEnd, saveCanvasEnd} from "src/request/end";
import {resetZoom} from "./zoomStore";
import {recordCanvasChangeHistory} from "./historySlice";
import {cloneDeep} from "lodash";
import {defaultComponentStyle_0, isGroupComponent} from "src/utils/const";

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

    hasSavedCanvas: true, // 画布编辑后是否被保存
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

// 初始化
export const initCanvas = () => {
  useEditStore.setState((draft) => {
    (draft.canvas = {
      id: null,
      title: "未命名",
      type: "content",
      content: getDefaultCanvasContent(),
    }),
      (draft.hasSavedCanvas = true); // 画布编辑后是否被保存
    // 记录选中组件的下标
    draft.assembly = new Set();

    // 历史
    (draft.canvasChangeHistory = [
      {
        canvas: {
          id: null,
          title: "未命名",
          type: "content",
          content: getDefaultCanvasContent(),
        },
        assembly: new Set(),
      },
    ]),
      (draft.canvasChangeHistoryIndex = 0);
  });

  resetZoom();
};

export const clearCanvas = () => {
  useEditStore.setState((draft) => {
    draft.canvas.content = getDefaultCanvasContent();
    draft.hasSavedCanvas = false;
    draft.assembly.clear();
    recordCanvasChangeHistory(draft);
  });

  resetZoom();
};

export const addCmp = (_cmp: ICmp) => {
  useEditStore.setState((draft) => {
    draft.canvas.content.cmps.push({..._cmp, key: getOnlyKey()});
    draft.hasSavedCanvas = false;
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
    draft.hasSavedCanvas = false;
    draft.assembly = newAssembly;
  });
};

//  删除选中的组件
// 如果选中的是组合组件，则要把相关的子组件全部删除
// 如果选中的是组合子组件，则除了删除这个组件之外，还要更新父组合组件的 groupCmpKeys
export const delSelectedCmps = () => {
  useEditStore.setState((draft) => {
    let {cmps} = draft.canvas.content;
    const map = getCmpsMap(cmps);
    // newAssembly 会存储待删除的子组件、父组件、普通组件的下标等
    const newAssembly: Set<number> = new Set();

    draft.assembly.forEach((index) => {
      const cmp = cmps[index];
      if (cmp.type & isGroupComponent) {
        cmp.groupCmpKeys?.forEach((item) => {
          newAssembly.add(map.get(item));
        });
      }
      // 如果是group组件，最后添加
      newAssembly.add(index);
    });

    // ! 当删除单个组合组件的子节点之后，需要调整父组件的位置和宽高
    // 因为在删除单个之后，cmps index会发生变化，为了复用map和cmps，我们在这里先调整父组件的位置和宽高
    if (newAssembly.size === 1) {
      const child: ICmpWithKey = cmps[Array.from(newAssembly)[0]];
      // child是要被删除的组件，
      // 所以接下来要调整矩形，这个矩形的位置和宽高根据除child之外的组合子组件来计算
      if (child.groupKey) {
        const groupIndex = map.get(child.groupKey);
        const group = cmps[groupIndex];
        // 这个节点要删除，因此要寻找的是其它相关子组件的index
        const _newAssembly: Set<number> = new Set();
        group.groupCmpKeys?.forEach((key) => {
          if (key !== child.key) {
            _newAssembly.add(map.get(key));
          }
        });

        Object.assign(group.style, computeBoxStyle(cmps, _newAssembly));
      }
    }
    // 删除节点
    cmps = cmps.filter((cmp, index) => {
      // 这个组件要被删除
      const del = newAssembly.has(index);
      if (del) {
        // 如果这个组件是组合子组件
        let groupKey = cmp.groupKey;

        if (groupKey) {
          const groupIndex = map.get(cmp.groupKey);
          // 如果父组件也要被删除，这里就不用管了，不然要更新下父组件的 groupCmpKeys
          if (!newAssembly.has(groupIndex)) {
            const group = cmps[groupIndex];
            const s = new Set(group.groupCmpKeys);
            s.delete(cmp.key);
            group.groupCmpKeys = Array.from(s);
          }
        }
      }

      if (cmp.type & isGroupComponent) {
        const {groupCmpKeys} = cmp;
        const len = groupCmpKeys!.length;
        if (len < 2) {
          // 如果只有一个子组件了，那么没必要再是组合组件了
          if (groupCmpKeys?.length === 1) {
            const singleCmpIndex = map.get(groupCmpKeys[0]);
            cmps[singleCmpIndex].groupKey = undefined;
          }
          return false;
        }
      }

      return !del;
    });

    draft.canvas.content.cmps = cmps;
    draft.hasSavedCanvas = false;
    draft.assembly.clear();
    recordCanvasChangeHistory(draft);
  });
};

// isNew 标记是否为新增页面，如果是新增，则在保存后需要跳转一次路由
export const saveCanvas = async (
  successCallback: (id: number, isNew: boolean, res: any) => void
) => {
  const canvas = useEditStore.getState().canvas;
  let isNew = canvas.id == null;
  const res: any = await Axios.post(saveCanvasEnd, {
    id: canvas.id,
    type: canvas.type,
    title: canvas.title,
    content: JSON.stringify(canvas.content),
  });

  successCallback(res?.id, isNew, res);

  useEditStore.setState((draft) => {
    if (isNew) {
      draft.canvas.id = res.id;
    }
    draft.hasSavedCanvas = true;
  });
};

// 选择模板，生成页面
export const addCanvasByTpl = (res: any) => {
  useEditStore.setState((draft) => {
    draft.canvas.content = JSON.parse(res.content);
    draft.hasSavedCanvas = false;
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
    const cmps = draft.canvas.content.cmps;
    let len = cmps.length;
    // 当存在组合组件，需要筛选出来组合子组件
    const array = [];
    for (let i = 0; i < len; i++) {
      if (cmps[i].groupKey) {
        continue;
      }
      array.push(i);
    }
    draft.assembly = new Set(array);
  });
};

// 选中多个
// 如果再次点击已经选中的组件，则取消选中
export const setCmpsSelected = (indexes: Array<number>) => {
  useEditStore.setState((draft) => {
    const cmps = cmpsSelector(draft);
    // 如果此时已经有组合子组件被选中，不允许和其它组件一起选中
    if (draft.assembly.size === 1) {
      const selectedIndex = selectedCmpIndexSelector(draft);
      const selectedCmp = cmps[selectedIndex];
      if (selectedCmp.groupKey) {
        // 取消原来的组合子组件选中状态
        draft.assembly = new Set();
      }
    }
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
  // 如果是组合组件，则选中其相关的组件
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

// 根据组合子组件index，返回父组件index
export const getCmpGroupIndex = (childIndex: number): undefined | number => {
  const store = useEditStore.getState();
  const cmps = cmpsSelector(store);
  const map = getCmpsMap(cmps);
  const groupIndex = map.get(cmps[childIndex].groupKey);
  return groupIndex;
};

// ! 修改组件属性
// 根据改变的量来修改
export const updateAssemblyCmpsByDistance = (
  newStyle: Style,
  autoAdjustment?: boolean
) => {
  useEditStore.setState((draft) => {
    // 如果包括组合组件，那么此时需要寻找相关的子组件
    const {cmps} = draft.canvas.content;
    const map = getCmpsMap(cmps);
    // 下标：组合组件子组件、组合组件的父组件、普通组件、
    let newAssembly: Set<number> = new Set();

    draft.assembly.forEach((index) => {
      const cmp = cmps[index];
      if (cmp.type & isGroupComponent) {
        cmp.groupCmpKeys?.forEach((item) => {
          newAssembly.add(map.get(item));
        });
      }
      newAssembly.add(index);
    });

    newAssembly.forEach((index) => {
      const selectedCmp = {...cmps[index]};
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

      // 检查自动调整，对齐
      if (
        draft.assembly.size === 1 &&
        !selectedCmp.groupKey &&
        autoAdjustment
      ) {
        // 对齐画布或者组件
        // 画布
        autoAlignToCanvas(canvasStyleSelector(draft), selectedCmp);

        // 对齐单个组件
        // 这个时候画布和组件会相互影响。一般产品会做一个取舍，对齐画布还是组件
        const cmps = cmpsSelector(draft);
        cmps.forEach((cmp, cmpIndex) => {
          const inView = isCmpInView(cmp);

          // 如果选中的是组合组件，那么与它自己的子组件肯定不对齐
          // 如果是组合组件，不要和自己的子组件对齐
          if (
            selectedCmp.type & isGroupComponent &&
            selectedCmp.key === cmp.groupKey
          ) {
          } else if (cmpIndex !== index && inView) {
            autoAlignToCmp(cmp.style, selectedCmp);
          }
        });
      }

      if (!invalid) {
        draft.canvas.content.cmps[index] = selectedCmp;
      }

      // 移动或者拉伸单个子组件之后，父组件的宽高和位置也会发生变化
      // 重新计算组合组件的位置和宽高
      // 如果group变动，那么其相关子节点的位置也要发生变化
      if (newAssembly.size === 1 && selectedCmp.groupKey) {
        const groupIndex = map.get(selectedCmp.groupKey);
        const group = cmps[groupIndex];
        const _newAssembly: Set<number> = new Set();
        group.groupCmpKeys?.forEach((key: string) => {
          _newAssembly.add(map.get(key));
        });

        Object.assign(group.style, computeBoxStyle(cmps, _newAssembly));
      }
    });

    draft.canvas.content.cmps = cmps;
    draft.hasSavedCanvas = false;
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
    draft.hasSavedCanvas = false;
    recordCanvasChangeHistory(draft);
  });
};

// ! 更新画布属性
export const updateCanvasStyle = (_style: any) => {
  useEditStore.setState((draft) => {
    Object.assign(draft.canvas.content.style, _style);
    draft.hasSavedCanvas = false;
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
    draft.hasSavedCanvas = false;
  });
};

// 修改单个组件的属性
export const updateSelectedCmpAttr = (name: string, value: string | Object) => {
  useEditStore.setState((draft: any) => {
    const selectedIndex = selectedCmpIndexSelector(draft);
    if (typeof value === "object") {
      Object.assign(draft.canvas.content.cmps[selectedIndex][name], value);
    } else {
      draft.canvas.content.cmps[selectedIndex][name] = value;
    }

    draft.hasSavedCanvas = false;
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
      draft.hasSavedCanvas = false;

      recordCanvasChangeHistory(draft);
    });
  });
};

// ! 单个组件修改层级
// 0  4 5 1 2 3
// 置顶，把组件放到数组最后
// 如果是组合组件N，包含n个子组件，则组件顺序如下：
// 0...m, n0,n1,n2...,N 则把组合组件放到最后，
// m + n + 1 = len
// [m0,m1,...mm,n0,n1...,nn, N]
export const topZIndex = () => {
  useEditStore.setState((draft) => {
    const cmps = draft.canvas.content.cmps;
    const selectedIndex = selectedCmpIndexSelector(draft);
    const selectedCmp = cmps[selectedIndex];
    if (selectedCmp.type & isGroupComponent) {
      // 组合组件
      const len = cmps.length;
      const groupCmpKeys = new Set(selectedCmp.groupCmpKeys);
      let m = 0,
        n = len - groupCmpKeys.size - 1;
      const cmps2 = [...cmps];
      for (let i = 0; i < len; i++) {
        const cmp = cmps2[i];
        if (cmp.key === selectedCmp.key) {
          // 父组件
          cmps[len - 1] = cmp;
        } else if (groupCmpKeys.has(cmp.key)) {
          // 子组件
          cmps[n++] = cmp;
        } else {
          cmps[m++] = cmp;
        }
      }
    } else {
      if (selectedIndex === cmps.length - 1) {
        return;
      }
      draft.canvas.content.cmps = cmps
        .slice(0, selectedIndex)
        .concat(cmps.slice(selectedIndex + 1))
        .concat(cmps[selectedIndex]);
    }

    draft.hasSavedCanvas = false;
    draft.assembly = new Set([cmps.length - 1]);
    recordCanvasChangeHistory(draft);
  });
};

// 置底，把组件放到数组位置0
// 如果是组合组件 M，包含m个子组件，则组件顺序如下：
// M, m0, m1, m2,..., 组件其它
// 0 1 2 3 4
export const bottomZIndex = () => {
  useEditStore.setState((draft) => {
    const cmps = draft.canvas.content.cmps;
    const selectedIndex = selectedCmpIndexSelector(draft);
    const selectedCmp = cmps[selectedIndex];
    if (selectedCmp.type & isGroupComponent) {
      // 组合组件
      const len = cmps.length;
      const groupCmpKeys = new Set(selectedCmp.groupCmpKeys);
      let m = 1,
        n = groupCmpKeys.size + 1;
      const cmps2 = [...cmps];
      for (let i = 0; i < len; i++) {
        const cmp = cmps2[i];
        if (cmp.key === selectedCmp.key) {
          // 父组件
          cmps[0] = cmp;
        } else if (groupCmpKeys.has(cmp.key)) {
          // 子组件
          cmps[m++] = cmp;
        } else {
          cmps[n++] = cmp;
        }
      }
    } else {
      if (selectedIndex === 0) {
        return;
      }
      draft.canvas.content.cmps = [cmps[selectedIndex]]
        .concat(cmps.slice(0, selectedIndex))
        .concat(cmps.slice(selectedIndex + 1));
    }
    draft.hasSavedCanvas = false;
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

    draft.hasSavedCanvas = false;
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

    draft.hasSavedCanvas = false;
    draft.assembly = new Set([selectedIndex - 1]);

    recordCanvasChangeHistory(draft);
  });
};

// 组合组件
// 把多个子组件组合到一个组合组件里
// 如果子组件本身就是组合组件，那么需要把这个组合组件的子组件筛选取出来，最后再把所有子组件放到一个组合组件里。最后不要忘记把原先的组合组件删除
export const groupCmps = () => {
  useEditStore.setState((draft) => {
    let {cmps} = draft.canvas.content;
    const map = getCmpsMap(cmps);

    const {top, left, width, height} = computeBoxStyle(cmps, draft.assembly);
    // 组合所有子组件
    // 生成一个新的父组件，
    const groupCmp: ICmpWithKey = {
      key: getOnlyKey(),
      type: isGroupComponent,
      style: {
        ...defaultComponentStyle_0,
        top,
        left,
        width,
        height,
      },
      groupCmpKeys: [],
    };

    draft.assembly.forEach((index: number) => {
      const cmp = cmps[index];
      // 如果组件是组合组件，遍历查找这个组合组件的子组件
      if (cmp.type & isGroupComponent) {
        cmp.groupCmpKeys?.forEach((key) => {
          const childCmpIndex = map.get(key);
          const child = cmps[childCmpIndex];
          groupCmp.groupCmpKeys!.push(child.key);
          child.groupKey = groupCmp.key;
          map.delete(child.key);
        });
      } else {
        groupCmp.groupCmpKeys!.push(cmp.key);
        cmp.groupKey = groupCmp.key;
      }
    });

    // 删除老的组合组件
    cmps = cmps.filter(
      (cmp, index) =>
        !(cmp.type & isGroupComponent && draft.assembly.has(index))
    );

    cmps.push(groupCmp);
    draft.canvas.content.cmps = cmps;
    draft.hasSavedCanvas = false;
    draft.assembly = new Set([cmps.length - 1]);
    recordCanvasChangeHistory(draft);
  });
};

// 取消组合
// 选中了一个组件组合，把子组件拆分出来
export const cancelGroupCmps = () => {
  useEditStore.setState((draft) => {
    // 1. 拆分子组件
    // 2. 删除父组件
    // 3. 选中子组件
    let {cmps} = draft.canvas.content;
    const selectedIndex = selectedCmpIndexSelector(draft);
    const selectedGroup = cmps[selectedIndex];
    const map = getCmpsMap(cmps);
    const newAssembly: Set<number> = new Set();
    selectedGroup.groupCmpKeys?.forEach((key) => {
      const cmpIndex = map.get(key);
      const cmp = cmps[cmpIndex];
      cmp.groupKey = undefined;
      newAssembly.add(cmpIndex);
    });
    cmps = cmps.slice(0, selectedIndex).concat(cmps.slice(selectedIndex + 1));
    draft.canvas.content.cmps = cmps;
    draft.hasSavedCanvas = false;
    draft.assembly = newAssembly;
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

export function getCmpsMap(cmps: Array<ICmpWithKey>) {
  const map = new Map();
  cmps.forEach((cmp, index) => {
    map.set(cmp.key, index);
  });
  return map;
}

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
