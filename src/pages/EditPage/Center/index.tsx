import React, {useState} from "react";
import classNames from "classnames";
import useEditStore, {selectedCmpIndexSelector} from "src/store/editStore";
import Cmp from "../EditCmp/Cmp";
import EditLine from "../EditCmp/EditLine";
import ContextMenu from "../ContextMenu";
import styles from "./index.module.less";

export default function Center() {
  const editStore = useEditStore();
  const {canvas, assembly, setCmpsSelected} = editStore;
  const {cmps, style} = canvas;

  // 缩放比例
  const [zoom, setZoom] = useState(() =>
    parseInt(style.width as string) > 800 ? 50 : 100
  );

  const onDrop = (e: any) => {
    const endX = e.pageX;
    const endY = e.pageY;

    let dragCmp = e.dataTransfer.getData("drag-cmp");

    if (!dragCmp) {
      return;
    }

    dragCmp = JSON.parse(dragCmp);

    const canvasDOMPos = {
      top: 110,
      left:
        document.body.clientWidth / 2 -
        (parseInt(style.width as string) / 2) * (zoom / 100),
    };

    const startX = canvasDOMPos.left;
    const startY = canvasDOMPos.top;

    let disX = endX - startX;
    let disY = endY - startY;

    disX = disX * (100 / zoom);
    disY = disY * (100 / zoom);

    dragCmp.style.left = disX - dragCmp.style.width / 2;
    dragCmp.style.top = disY - dragCmp.style.height / 2;

    editStore.addCmp(dragCmp);
  };

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const selectedIndex = selectedCmpIndexSelector(editStore);

  const whichKeyEvent = (e) => {
    if (
      (e.target as Element).nodeName === "INPUT" ||
      (e.target as Element).nodeName === "TEXTAREA"
    ) {
      return;
    }

    if (e.metaKey && e.code === "KeyA") {
      // 选中所有组件
      // 返回所有数组下标

      setCmpsSelected(
        Object.keys(cmps).map((item: string): number => parseInt(item))
      );
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
      <div
        id="canvas"
        className={styles.canvas}
        style={{
          ...style,
          backgroundImage: `url(${style.backgroundImage})`,
          transform: `scale(${zoom / 100})`,
        }}
        onDrop={onDrop}
        onDragOver={allowDrop}>
        {/* 组件选中的时候，画布显示该组件的编辑区域 */}
        {selectedIndex !== -1 && (
          <EditLine selectedIndex={selectedIndex} zoom={zoom} />
        )}

        <div
          className={styles.cmps}
          style={{
            width: style.width,
            height: style.height,
          }}>
          {/* 组件区域 */}
          {cmps.map((cmp: any, index: number) => (
            <Cmp
              key={cmp.key}
              cmp={cmp}
              index={index}
              selectedIndex={selectedIndex}
              isSelected={assembly.has(index)}
              setCmpsSelected={setCmpsSelected}
            />
          ))}
        </div>
      </div>
      <ContextMenu />
      <ul className={styles.zoom}>
        <li
          className={classNames(styles.icon)}
          style={{cursor: "zoom-in"}}
          onClick={() => {
            setZoom(zoom + 25);
          }}>
          +
        </li>
        <li className={classNames(styles.num)}>
          <input
            type="num"
            value={zoom}
            onChange={(e: any) => {
              let newValue = e.target.value;
              newValue = newValue >= 1 ? newValue : 1;
              setZoom(newValue - 0);
            }}
          />
          %
        </li>
        <li
          className={classNames(styles.icon)}
          style={{cursor: "zoom-out"}}
          onClick={() => {
            const newZoom = zoom - 25 >= 1 ? zoom - 25 : 1;
            setZoom(newZoom);
          }}>
          -
        </li>
      </ul>
    </div>
  );
}
