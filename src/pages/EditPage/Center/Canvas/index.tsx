import useEditStore, {addCmp} from "src/store/editStore";
import styles from "./index.module.less";
import Cmp from "../Cmp";

export default function Canvas() {
  const canvas = useEditStore((state) => state.canvas);
  const {cmps, style} = canvas;

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
      left: (document.body.clientWidth - style.width) / 2,
    };

    let disX = endX - canvasDomPos.left;
    let disY = endY - canvasDomPos.top;

    dragCmp.style.left = disX - dragCmp.style.width / 2;
    dragCmp.style.top = disY - dragCmp.style.height / 2;

    // 3. 把组件存到state store中
    addCmp(dragCmp);
  };

  const allowDraop = (e) => {
    e.preventDefault();
  };
  console.log("canvas render", cmps); //sy-log
  return (
    <div
      id="canvas"
      className={styles.main}
      style={canvas.style}
      onDrop={onDrop}
      onDragOver={allowDraop}>
      {cmps.map((item, index) => (
        <Cmp key={item.key} cmp={item} index={index}></Cmp>
      ))}
    </div>
  );
}
