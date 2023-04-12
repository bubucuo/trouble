import Item from "src/lib/Item";
import styles from "./index.module.less";
import useEditStore from "src/store/editStore";
import {_Style} from "src/store/editStoreTypes";

export default function EditMultiCmps() {
  const editStore = useEditStore();

  return (
    <div className={styles.main}>
      <div className={styles.title}>批量修改多个组件属性</div>

      <Item label="对齐页面: ">
        <select
          className={styles.itemRight}
          onChange={(e) => {
            const align = e.target.value;
            let newStyle: _Style = {};
            switch (align) {
              case "left":
                newStyle.left = 0;
                break;
              case "right":
                newStyle.right = 0;
                break;

              case "x-center":
                newStyle.left = "center";
                break;
              case "top":
                newStyle.top = 0;
                break;
              case "bottom":
                newStyle.bottom = 0;
                break;

              case "y-center":
                newStyle.top = "center";
                break;
            }
            editStore.editAssemblyStyle(newStyle);
          }}>
          <option>选择对齐页面方式--</option>
          <option value="left">左对齐</option>
          <option value="right">右对齐</option>
          <option value="x-center">水平居中</option>
          <option value="top">上对齐</option>
          <option value="bottom">下对齐</option>
          <option value="y-center">垂直居中</option>
        </select>
      </Item>
    </div>
  );
}
