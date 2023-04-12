import styles from "./index.module.less";
import useEditStore, {dontRecordHistory} from "src/store/editStore";
import {throttle} from "lodash";

interface IStretchProps {
  zoom: number;
  style: any;
}

export default function StretchDots(props: IStretchProps) {
  const editStore = useEditStore();
  const {style} = props;
  const {width, height, transform} = style;

  // 伸缩组件 style top left width height
  const onMouseDown = (e) => {
    const direction = e.target.dataset.direction;
    if (!direction) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    let startX = e.pageX;
    let startY = e.pageY;

    const {zoom} = props;
    let hasMoved = false;
    const move = throttle((e) => {
      hasMoved = true;
      const x = e.pageX;
      const y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      // style top left width height
      let newStyle: {top?: number; left?: number} = {};
      // todo top left
      if (direction) {
        if (direction.indexOf("top") >= 0) {
          disY = 0 - disY;
          // newStyle.top = parseInt(newStyle.top);
          newStyle.top = -disY;
        }

        if (direction.indexOf("left") >= 0) {
          disX = 0 - disX;
          newStyle.left = -disX;
        }
      }

      Object.assign(newStyle, {
        width: disX,
        height: disY,
      });

      // 频繁修改，此时不记录到历史记录里，只有up阶段才记录
      if (hasMoved) {
        editStore.updateAssemblyCmps(newStyle, dontRecordHistory);
      }
      startX = x;
      startY = y;
    }, 80);

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);

      editStore.recordCanvasChangeHistoryAfterBatch();
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return (
    <>
      <div
        className={styles.stretchDot}
        style={{
          top: -8,
          left: -8,
          transform,
          cursor: "nwse-resize",
        }}
        data-direction="top, left"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: -8,
          left: width / 2 - 8,
          transform,
          cursor: "row-resize",
        }}
        data-direction="top"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: -8,
          left: width - 12,
          transform,
          cursor: "nesw-resize",
        }}
        data-direction="top right"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: height / 2 - 8,
          left: width - 12,
          transform,
          cursor: "col-resize",
        }}
        data-direction="right"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: height - 10,
          left: width - 12,
          transform,
          cursor: "nwse-resize",
        }}
        data-direction="bottom right"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: height - 10,
          left: width / 2 - 8,
          transform,
          cursor: "row-resize",
        }}
        data-direction="bottom"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: height - 10,
          left: -8,
          transform,
          cursor: "nesw-resize",
        }}
        data-direction="bottom left"
        onMouseDown={onMouseDown}
      />
      <div
        className={styles.stretchDot}
        style={{
          top: height / 2 - 8,
          left: -8,
          transform,
          cursor: "col-resize",
        }}
        data-direction="left"
        onMouseDown={onMouseDown}
      />
    </>
  );
}
