import styles from "./index.module.less";
import Canvas from "./Canvas";
import useEditStore, {
  addZIndex,
  canvasStyleSelector,
  delSelectedCmps,
  setAllCmpsSelected,
  setCmpSelected,
  subZIndex,
} from "src/store/editStore";
import Zoom from "./Zoom";
import useZoomStore from "src/store/zoomStore";
import {updateAssemblyCmpsByDistance} from "src/store/editStore";

export default function Center() {
  const canvasStyle = useEditStore(canvasStyleSelector);
  const {zoom, zoomIn, zoomOut} = useZoomStore();

  const keyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as Element).nodeName === "TEXTAREA") {
      return;
    }

    // CMD + key
    if (e.metaKey) {
      switch (e.code) {
        case "KeyA":
          setAllCmpsSelected();
          return;

        case "Equal":
          zoomOut();
          e.preventDefault();
          return;

        case "Minus":
          zoomIn();
          e.preventDefault();
          return;

        // 上移一层
        case "ArrowUp":
          e.preventDefault();
          addZIndex();
          return;

        // 下移一层
        case "ArrowDown":
          e.preventDefault();
          subZIndex();
          return;
      }
    }

    // 键盘事件
    switch (e.code) {
      case "Backspace":
        delSelectedCmps();
        return;

      // 左移
      case "ArrowLeft":
        e.preventDefault();
        updateAssemblyCmpsByDistance({left: -1});
        return;

      // 右移
      case "ArrowRight":
        e.preventDefault();
        updateAssemblyCmpsByDistance({left: 1});
        return;

      // 上移
      case "ArrowUp":
        e.preventDefault();
        updateAssemblyCmpsByDistance({top: -1});
        return;

      // 下移
      case "ArrowDown":
        e.preventDefault();
        updateAssemblyCmpsByDistance({top: 1});
        return;
    }
  };
  return (
    <div
      id="center"
      className={styles.main}
      style={{
        minHeight: (zoom / 100) * canvasStyle.height + 100,
      }}
      tabIndex={0}
      onClick={(e: React.MouseEvent) => {
        if ((e.target as HTMLElement).id.indexOf("cmp") === -1) {
          setCmpSelected(-1);
        }
      }}
      onKeyDown={keyDown}
      onContextMenu={(e) => {
        e.preventDefault();
      }}>
      <Canvas />

      <Zoom />
    </div>
  );
}
