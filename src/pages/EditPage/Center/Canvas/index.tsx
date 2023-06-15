import useEditStore, {
  addCmp,
  fetchCanvas,
  initCanvas,
} from "src/store/editStore";
import styles from "./index.module.less";
import Cmp from "../Cmp";
import {useEffect} from "react";
import {useCanvasId} from "src/store/hooks";
import EditBox from "../EditBox";
import useZoomStore from "src/store/zoomStore";
import {ICmpWithKey} from "src/store/editStoreTypes";
import ReferenceLines from "../ReferenceLines";

export default function Canvas() {
  const zoom = useZoomStore((state) => state.zoom);
  const [canvas, assembly] = useEditStore((state) => [
    state.canvas,
    state.assembly,
  ]);
  const {cmps, style} = canvas.content;

  const id = useCanvasId();
  useEffect(() => {
    if (id) {
      fetchCanvas(id);
    }

    return () => {
      // 退出页面之前，初始化数据。否则下次再次进入页面，上次数据会被再次利用。
      // 这个目的其实在28行的else里实现也可以，但是这样的话，编辑页退出之后，数据依然是存在内存中的，只是下次再进入页面的时候才被初始化
      // 因此为了内存考虑，可以在组件销毁前，执行初始化函数
      initCanvas();
    };
  }, []);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const canvasDomPos = {
      top: 114 + 1,
      left:
        document.body.clientWidth / 2 - ((style.width + 2) / 2) * (zoom / 100),
    };
    // 1. 读取被拖拽的组件信息
    let dragCmp: any = e.dataTransfer.getData("drag-cmp");
    if (!dragCmp) {
      return;
    }
    dragCmp = JSON.parse(dragCmp) as ICmpWithKey;

    // 2. 读取用户松手的位置，相对网页
    const endX = e.pageX;
    const endY = e.pageY;

    let disX = endX - canvasDomPos.left;
    let disY = endY - canvasDomPos.top;

    disX = disX * (100 / zoom);
    disY = disY * (100 / zoom);

    dragCmp.style.left = disX - dragCmp.style.width / 2;
    dragCmp.style.top = disY - dragCmp.style.height / 2;

    // 3. 把组件存到state store中
    addCmp(dragCmp);
  };

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  console.log("canvas render", cmps); //sy-log

  return (
    <div
      id="canvas"
      className={styles.main}
      style={{
        ...style,
        backgroundImage: `url(${style.backgroundImage})`,
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

      <ReferenceLines canvasStyle={style} />
    </div>
  );
}
