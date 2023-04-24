import useEditStore, {
  addCmp,
  clearCanvas,
  fetchCanvas,
} from "src/store/editStore";
import styles from "./index.module.less";
import Cmp from "../Cmp";
import {useEffect} from "react";
import {useCanvasId} from "src/store/hooks";
import EditBox from "../EditBox";
import useZoomStore from "src/store/zoomStore";

export default function Canvas() {
  const zoom = useZoomStore((state) => state.zoom);
  const [canvas, assembly] = useEditStore((state) => [
    state.canvas,
    state.assembly,
  ]);
  const {cmps, style} = canvas;

  const id = useCanvasId();
  useEffect(() => {
    if (id) {
      fetchCanvas(id);
    } else {
      clearCanvas();
    }
  }, []);

  const onDrop = (e) => {
    // 1. 读取被拖拽的组件信息
    let dragCmp = e.dataTransfer.getData("drag-cmp");
    if (!dragCmp) {
      return;
    }
    dragCmp = JSON.parse(dragCmp);

    // 2. 读取用户松手的位置，相对网页
    const endX = e.pageX;
    const endY = e.pageY;

    const canvasDomPos = {
      top: 114,
      left: document.body.clientWidth / 2 - (style.width / 2) * (zoom / 100),
    };

    let disX = endX - canvasDomPos.left;
    let disY = endY - canvasDomPos.top;

    disX = disX * (100 / zoom);
    disY = disY * (100 / zoom);

    dragCmp.style.left = disX - dragCmp.style.width / 2;
    dragCmp.style.top = disY - dragCmp.style.height / 2;

    // 3. 把组件存到state store中
    addCmp(dragCmp);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };
  console.log("canvas render", cmps); //sy-log
  return (
    <div
      id="canvas"
      className={styles.main}
      style={{
        ...canvas.style,
        transform: `scale(${zoom / 100})`,
      }}
      onDrop={onDrop}
      onDragOver={allowDrop}>
      <EditBox />
      {cmps.map((item, index) => (
        <Cmp
          key={item.key}
          cmp={item}
          index={index}
          isSelected={assembly.has(index)}></Cmp>
      ))}
    </div>
  );
}
