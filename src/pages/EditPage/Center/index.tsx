import React from "react";
import useEditStore, {selectedCmpIndexSelector} from "src/store/editStore";
import Menu from "../Menu";
import styles from "./index.module.less";
import Canvas from "./Canvas";
import Zoom from "./Zoom";
import useZoomStore from "./Zoom/zoomStore";

export default function Center() {
  const editStore = useEditStore();
  const {canvas, setCmpsSelected} = editStore;
  const {zoomIn, zoomOut} = useZoomStore();
  const {cmps} = canvas;

  const selectedIndex = selectedCmpIndexSelector(editStore);

  const whichKeyEvent = (e) => {
    if (
      (e.target as Element).nodeName === "INPUT" ||
      (e.target as Element).nodeName === "TEXTAREA"
    ) {
      return;
    }

    if (e.metaKey) {
      switch (e.code) {
        case "KeyA":
          // 选中所有组件
          // 返回所有数组下标
          setCmpsSelected(
            Object.keys(cmps).map((item: string): number => parseInt(item))
          );
          break;
        case "KeyZ":
          if (e.shiftKey) {
            editStore.goNextCanvasHistory();
          } else {
            editStore.goPrevCanvasHistory();
          }
          break;

        case "Equal":
          zoomOut();
          break;
        case "Minus":
          zoomIn();
          break;
      }

      // 阻止默认事件，比如网页的缩放
      e.preventDefault();
      return;
    }

    const selectedCmp = cmps[selectedIndex];
    if (!selectedCmp) {
      return;
    }

    if (e.keyCode < 37 || e.keyCode > 40) {
      return;
    }

    // 阻止事件传播，不然别的输入框的输入事件都不生效了
    e.stopPropagation();
    // 禁止默认事件，不然引发的可能是页面的上下左右滚动。
    e.preventDefault();

    const newStyle: {top?: number; left?: number} = {};

    switch (e.keyCode) {
      // 左
      case 37:
        newStyle.left = -1;
        break;

      // 上
      case 38:
        newStyle.top = -1;
        break;

      // 右
      case 39:
        newStyle.left = 1;
        break;

      // 下
      case 40:
        newStyle.top = 1;
        break;

      default:
        break;
    }

    editStore.updateAssemblyCmps(newStyle);
  };

  return (
    <div
      id="center"
      className={styles.main}
      tabIndex={0}
      onKeyDown={whichKeyEvent}
      onClick={(e: any) => {
        if ((e.target as Element).id === "center") {
          setCmpsSelected(-1);
        }
      }}>
      <Canvas selectedIndex={selectedIndex} />

      <Menu />
      <Zoom />
    </div>
  );
}
