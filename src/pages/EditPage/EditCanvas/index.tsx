import InputColor from "src/lib/InputColor";
import Item from "src/lib/Item";
import {ChangeEvent} from "react";
import styles from "./index.module.less";
import useEditStore, {IEditStore} from "src/store/editStore";
import {useEditStoreCanvas} from "src/store/editHooks";

export default function EditCanvas() {
  const editStore = useEditStore() as IEditStore;
  const canvasData = useEditStoreCanvas(); // editStore.canvas; // canvas.getCanvas();
  const style = canvasData.style; // editStore.getCanvas().style;

  const handleStyleChange = (
    e: ChangeEvent,
    {name, value}: {name: string; value: number | string}
  ) => {
    editStore.updateCanvasStyle({[name]: value});
  };

  return (
    <div className={styles.main}>
      <div className={styles.title}>画布属性</div>
      <Item label="标题: ">
        <input
          type="text"
          className={styles.itemRight}
          value={canvasData.title}
          onChange={(e) => {
            let newValue = e.target.value;
            // editStore.setCanvas({title: newValue});
            editStore.updateCanvasTitle(newValue);
          }}
        />
      </Item>

      <Item label="画布宽度 (px): ">
        <input
          type="number"
          className={styles.itemRight}
          value={style.width}
          onChange={(e) => {
            handleStyleChange(e, {
              name: "width",
              value: parseInt(e.target.value) - 0,
            });
          }}
        />
      </Item>

      <Item label="画布高度 (px): ">
        <input
          type="number"
          className={styles.itemRight}
          value={style.height}
          onChange={(e) => {
            handleStyleChange(e, {
              name: "height",
              value: parseInt(e.target.value) - 0,
            });
          }}
        />
      </Item>

      <Item label="背景颜色: ">
        <InputColor
          className={styles.itemRight}
          color={style.backgroundColor}
          onChangeComplete={(e: any) => {
            handleStyleChange(e, {
              name: "backgroundColor",
              value: `rgba(${Object.values(e.rgb).join(",")})`,
            });
          }}
        />
      </Item>

      <Item label="背景图片: ">
        <input
          type="text"
          className={styles.itemRight}
          value={style.backgroundImage}
          onChange={(e) => {
            handleStyleChange(e, {
              name: "backgroundImage",
              value: e.target.value,
            });
          }}
        />
      </Item>
    </div>
  );
}
