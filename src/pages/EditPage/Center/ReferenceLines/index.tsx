import classNames from "classnames";
import styles from "../Canvas/index.module.less";
import {throttle} from "lodash";
import useZoomStore from "src/store/zoomStore";
import {Style} from "src/store/editStoreTypes";
import {memo} from "react";

interface Props {
  canvasStyle: Style;
}

const ReferenceLines = memo(({canvasStyle}: Props) => {
  const {
    zoom,
    referenceLinesX,
    referenceLinesY,
    setReferenceLineX,
    clearReferenceLineX,
    setReferenceLineY,
    clearReferenceLineY,
  } = useZoomStore();

  // 画布的坐标位置
  const canvasDomPos = {
    top: 114 + 1,
    left:
      document.body.clientWidth / 2 -
      ((canvasStyle.width + 2) / 2) * (zoom / 100),
  };

  // 参考线的移动
  const onMouseDownOfLine = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.target as HTMLElement;
    const index = parseInt(element.dataset.index as string);
    const key = element.dataset.key as string;
    const direction = element.dataset.direction;

    const move = throttle((e) => {
      let disX = e.pageX - canvasDomPos.left;
      let disY = e.pageY - canvasDomPos.top;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      if (direction === "x") {
        if (disY < 0 || disY > canvasStyle.height) {
          clearReferenceLineX(index, key);
        } else {
          setReferenceLineX(index, disY);
        }
      } else {
        if (disX < 0 || disX > canvasStyle.width) {
          clearReferenceLineY(index, key);
        } else {
          setReferenceLineY(index, disX);
        }
      }
    }, 50);

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return (
    <>
      {referenceLinesX.map((line, index) => (
        <div
          key={line.key}
          className={classNames(styles.referenceLine, styles.referenceLineX)}
          style={{
            top: line.top,
          }}
          data-index={index}
          data-key={line.key}
          data-direction="x"
          onMouseDown={onMouseDownOfLine}
        />
      ))}

      {referenceLinesY.map((line, index) => {
        return (
          <div
            key={line.key}
            className={classNames(styles.referenceLine, styles.referenceLineY)}
            style={{
              left: line.left,
            }}
            data-index={index}
            data-key={line.key}
            data-direction="y"
            onMouseDown={onMouseDownOfLine}
          />
        );
      })}
    </>
  );
});

export default ReferenceLines;
