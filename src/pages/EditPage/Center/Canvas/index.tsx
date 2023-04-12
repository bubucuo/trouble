import {_Style} from "src/store/editStoreTypes";
import styles from "./index.module.less";
import Cmp from "../Cmp";
import useEditStore from "src/store/editStore";
import useZoomStore from "../Zoom/zoomStore";
import EditBox from "../EditBox";

interface CanvasProps {
  selectedIndex: number;
}

export default function Canvas({selectedIndex}: CanvasProps) {
  const zoom = useZoomStore((state) => state.zoom);

  const editStore = useEditStore();
  const {canvas, assembly, setCmpsSelected} = editStore;
  const {cmps, style} = canvas;

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

  return (
    <div
      id="canvas"
      className={styles.main}
      style={{
        ...style,
        backgroundImage: `url(${style.backgroundImage})`,
        transform: `scale(${zoom / 100})`,
        boxSizing: "border-box",
      }}
      onDrop={onDrop}
      onDragOver={allowDrop}>
      <EditBox />

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
            isSelected={assembly.has(index)}
            setCmpsSelected={setCmpsSelected}
          />
        ))}
      </div>
    </div>
  );
}
