import React from "react";

export type _Style = React.CSSProperties;

// 拖拽或者点击左边菜单，新增的组件，没有key，添加到画布中的时候生成唯一key
export interface ICmp {
  id?: number;
  type: number;
  style: _Style;
  data?: Object;
  value: string;
  onClick?: string; //点击跳转
}

export interface ICmpWithKey extends ICmp {
  key: number;
}

export interface ICanvas {
  title: string;
  style: _Style;
  cmps: Array<ICmpWithKey>;
}

export type Draft = any;
export type SetDraftFC = (draft: Draft) => void;

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

  // ! 更新画布属性
  updateCanvasStyle: (newStyle: any) => void;
  updateCanvasTitle: (title: string) => void;

  // 添加组件
  addCmp: (_cmp: ICmp) => void;

  // 选中的组件
  setCmpsSelected: (indexes: number | Array<number>) => void;
  updateSelectedCmpStyle: (newStyle: _Style) => void;
  updateSelectedCmpValue: (newValue: string) => void;
  updateSelectedCmpStyleAndValue: (newStyle: _Style, newValue: string) => void;
  updateAssemblyCmps: (newStyle: _Style, dontRecordHistory?: string) => void;

  // ! 更新组件属性
  updateSelectedCmpAttr: (name: string, value: string) => void;

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
  addAssemblyCmp: () => void;
  deleteCmps: () => void;

  // 层级
  addCmpZIndex: () => void;
  subCmpZIndex: () => void;
  topZIndex: () => void;
  bottomZIndex: () => void;
};

export interface IEditStore extends EditStoreState, EditStoreAction {}
