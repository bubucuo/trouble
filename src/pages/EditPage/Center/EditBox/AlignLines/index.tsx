import Line from "src/components/Line";
import {Style} from "src/store/editStoreTypes";

interface AlignLinesProps {
  canvasStyle: Style;
}

export default function AlignLines({canvasStyle}: AlignLinesProps) {
  return (
    <>
      {/* 对齐画布 */}
      {/* 中心 X 轴 */}
      <Line
        id="centerXLine"
        style={{
          top: canvasStyle.height / 2,
          left: 0,
          width: canvasStyle.width,
          backgroundColor: "red",
        }}
      />

      {/* 中心 Y 轴 */}
      <Line
        id="centerYLine"
        style={{
          top: 0,
          left: canvasStyle.width / 2,
          height: canvasStyle.height,
          backgroundColor: "red",
        }}
      />

      {/* 对齐画布 top */}
      <Line
        id="canvasLineTop"
        style={{
          top: 0,
          left: 0,
          width: canvasStyle.width,
          backgroundColor: "red",
        }}
      />
      <Line
        id="canvasLineBottom"
        style={{
          bottom: 0,
          left: 0,
          width: canvasStyle.width,
          backgroundColor: "red",
        }}
      />
      <Line
        id="canvasLineRight"
        style={{
          top: 0,
          right: 0,
          height: canvasStyle.height,
          backgroundColor: "red",
        }}
      />
      <Line
        id="canvasLineLeft"
        style={{
          top: 0,
          left: 0,
          height: canvasStyle.height,
          backgroundColor: "red",
        }}
      />

      {/* 对齐组件 */}
      <Line id="lineTop" />
      <Line id="lineBottom" />
      <Line id="lineLeft" />
      <Line id="lineRight" />

      {/* 组件的中心 X 轴 */}
      <Line id="lineX" />

      {/* 组件的中心 Y 轴 */}
      <Line id="lineY" />
    </>
  );
}
