import useEditStore, {
  cmpsSelector,
  dontRecordHistory,
  selectedCmpSelector,
} from "src/store/editStore";
import styles from "./index.module.less";
import useZoomStore from "../Zoom/zoomStore";
import {throttle} from "lodash";
import Rotate from "./Rotate";
import StretchDots from "./StretchDots";
import EditSingle from "./EditSingle";

export default function EditBox() {
  const editStore = useEditStore();
  const zoom = useZoomStore((state) => state.zoom);
  const {assembly} = editStore;

  const size = assembly.size;

  if (size === 0) {
    return null;
  }

  if (size === 1) {
    return <EditSingle zoom={zoom} />;
  }

  // 多个组件，此时需要计算外层的框架
  const cmps = cmpsSelector(editStore);

  let top = 9999,
    bottom = -9999,
    left = 9999,
    right = -9999;
  assembly.forEach((index) => {
    const cmp = cmps[index];

    top = Math.min(top, parseInt(cmp.style.top as string));
    left = Math.min(left, parseInt(cmp.style.left as string));

    bottom = Math.max(
      bottom,
      parseInt(cmp.style.top as string) + parseInt(cmp.style.height as string)
    );

    right = Math.max(
      right,
      parseInt(cmp.style.left as string) + parseInt(cmp.style.width as string)
    );
  });

  // 在画布上移动组件位置
  const onMouseDownOfCmp = (e) => {
    // 否则会触发其他组件的选中行为
    e.preventDefault();

    let startX = e.pageX;
    let startY = e.pageY;

    let hasMoved = false;
    const move = throttle((e) => {
      hasMoved = true;
      const x = e.pageX;
      const y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      editStore.updateAssemblyCmps({top: disY, left: disX}, dontRecordHistory);

      startX = x;
      startY = y;
    }, 50);

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      if (hasMoved) {
        editStore.recordCanvasChangeHistoryAfterBatch();
      }
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  let width = right - left + 6,
    height = bottom - top + 8;
  top -= 4;
  left -= 4;

  return (
    <div
      className={styles.main}
      style={{
        zIndex: 99999,
        width,
        height,
        top,
        left,
      }}
      onMouseDown={onMouseDownOfCmp}>
      <StretchDots
        zoom={zoom}
        style={{
          width,
          height,
        }}
      />
      {/* 旋转组件的标记 */}
      <Rotate zoom={zoom} style={{width, height}} />
    </div>
  );
}
