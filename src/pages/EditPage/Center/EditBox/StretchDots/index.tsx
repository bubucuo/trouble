import styles from "./index.module.less";
import {
  recordCanvasChangeHistory_2,
  updateAssemblyCmpsByDistance,
} from "src/store/editStore";
import {throttle} from "lodash";

interface IStretchProps {
  zoom: number;
  style: any;
}

export default function StretchDots(props: IStretchProps) {
  const {style, zoom} = props;
  const {width, height, transform} = style;

  // 伸缩组件 style top left width height
  const onMouseDown = (e) => {
    const direction = e.target.dataset.direction;

    if (!direction) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    let startX = e.pageX;
    let startY = e.pageY;

    const move = throttle((e) => {
      const x = e.pageX;
      const y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      let newStyle: any = {};

      if (direction) {
        if (direction.indexOf("top") >= 0) {
          disY = 0 - disY;
          newStyle.top = -disY;
        }
        if (direction.indexOf("left") >= 0) {
          disX = 0 - disX;
          newStyle.left = -disX;
        }
      }

      Object.assign(newStyle, {width: disX, height: disY});

      updateAssemblyCmpsByDistance(newStyle);

      startX = x;
      startY = y;
    }, 50);

    const up = () => {
      recordCanvasChangeHistory_2();
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return (
    <>
      <div
        className={styles.stretchDot}
        style={{
          top: -9,
          left: -9,
          transform,
          cursor: "nwse-resize",
        }}
        data-direction="top, left"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: -9,
          left: width / 2 - 9,
          transform,
          cursor: "row-resize",
        }}
        data-direction="top"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: -9,
          left: width - 11,
          transform,
          cursor: "nesw-resize",
        }}
        data-direction="top right"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: height / 2 - 11,
          left: width - 11,
          transform,
          cursor: "col-resize",
        }}
        data-direction="right"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: height - 11,
          left: width - 11,
          transform,
          cursor: "nwse-resize",
        }}
        data-direction="bottom right"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: height - 11,
          left: width / 2 - 9,
          transform,
          cursor: "row-resize",
        }}
        data-direction="bottom"
        onMouseDown={onMouseDown}
      />

      <div
        className={styles.stretchDot}
        style={{
          top: height - 11,
          left: -9,
          transform,
          cursor: "nesw-resize",
        }}
        data-direction="bottom left"
        onMouseDown={onMouseDown}
      />
      <div
        className={styles.stretchDot}
        style={{
          top: height / 2 - 11,
          left: -9,
          transform,
          cursor: "col-resize",
        }}
        data-direction="left"
        onMouseDown={onMouseDown}
      />
    </>
  );
}
