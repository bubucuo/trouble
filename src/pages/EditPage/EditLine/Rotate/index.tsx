import classNames from "classnames";
import styles from "./index.module.less";
import useEditStore, {
  dontRecordHistory,
  selectedCmpSelector,
} from "src/store/editStore";
import {throttle} from "lodash";

interface IRotateProps {
  zoom: number;
  style: any;
}

export default function Rotate(props: IRotateProps) {
  const editStore = useEditStore();

  const {zoom, style} = props;
  const {width, height, transform} = style;

  // 旋转组件
  const rotate = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const cmp = selectedCmpSelector(editStore);

    const {zoom} = props;
    const {style} = cmp;
    const {height, transform} = style;
    const trans = parseFloat(transform);

    const r = height / 2;

    const ang = ((trans + 90) * Math.PI) / 180;

    const [offsetX, offsetY] = [-Math.cos(ang) * r, -Math.sin(ang) * r];

    let startX = e.pageX + offsetX;
    let startY = e.pageY + offsetY;

    const move = throttle((e) => {
      let x = e.pageX;
      let y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      let deg: number = (360 * Math.atan2(disY, disX)) / (2 * Math.PI) - 90;

      deg = Math.ceil(deg); // parseInt(deg);

      editStore.updateAssemblyCmps(
        {
          transform: deg - transform,
        },
        dontRecordHistory
      );
    }, 180);

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      editStore.recordCanvasChangeHistoryAfterBatch();
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };
  return (
    <div
      className={classNames(styles.rotate, "iconfont icon-xuanzhuan")}
      style={{
        top: height + (30 * 100) / zoom,
        left: width / 2 - 13,
        transform,
      }}
      onMouseDown={rotate}
    />
  );
}
