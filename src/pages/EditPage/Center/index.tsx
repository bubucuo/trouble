import styles from "./index.module.less";
import Canvas from "./Canvas";
import useEditStore, {
  setAllCmpsSelected,
  setCmpSelected,
} from "src/store/editStore";
import Zoom from "./Zoom";
import useZoomStore from "src/store/zoomStore";

export default function Center() {
  const canvas = useEditStore((state) => state.canvas);
  const {zoom, zoomIn, zoomOut} = useZoomStore();
  const keyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as Element).nodeName === "TEXTAREA") {
      return;
    }

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
      }
    }
  };
  return (
    <div
      id="center"
      className={styles.main}
      style={{
        minHeight: (zoom / 100) * canvas.style.height + 100,
      }}
      tabIndex={0}
      onClick={(e: React.MouseEvent) => {
        if ((e.target as HTMLElement).id.indexOf("cmp") === -1) {
          setCmpSelected(-1);
        }
      }}
      onKeyDown={keyDown}>
      <Canvas />

      <Zoom />
    </div>
  );
}
