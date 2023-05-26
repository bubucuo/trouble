import classNames from "classnames";
import {throttle} from "lodash";
import {ICmpWithKey} from "src/store/editStoreTypes";
import {
  recordCanvasChangeHistory_2,
  updateSelectedCmpStyle,
} from "src/store/editStore";
import styles from "./index.module.less";

interface IRotateProps {
  zoom: number;
  selectedCmp: ICmpWithKey;
}

export default function Rotate(props: IRotateProps) {
  const {selectedCmp} = props;

  // 旋转组件
  const rotate = (e: React.MouseEvent<HTMLDivElement>) => {
    // 不要影响 EditBox 的移动事件
    e.stopPropagation();

    const {zoom} = props;
    const {style} = selectedCmp;
    const {height, transform} = style;

    // 角度转弧度：角度*π/180
    const angle = ((transform + 90) * Math.PI) / 180;

    const radius = height / 2;
    const [offsetX, offsetY] = [
      -Math.cos(angle) * radius,
      -Math.sin(angle) * radius,
    ];

    let startX = e.pageX + offsetX;
    let startY = e.pageY + offsetY;

    const move = throttle((e) => {
      let x = e.pageX;
      let y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      // Math.atan() 函数返回一个数值的反正切（以弧度为单位），一个-π/2到π/2弧度之间的数值。
      // 弧度变角度 180/ π*弧度
      let deg = (180 / Math.PI) * Math.atan2(disY, disX) - 90;
      deg = Math.ceil(deg);

      updateSelectedCmpStyle({transform: deg}, false);
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
    <div
      className={classNames(styles.rotate, "iconfont icon-xuanzhuan")}
      onMouseDown={rotate}
    />
  );
}
