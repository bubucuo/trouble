import Item from "src/lib/Item";
import {
  cancelGroupCmps,
  editAssemblyStyle,
  groupCmps,
} from "src/store/editStore";
import type {Style} from "src/store/editStoreTypes";
import styles from "./edit.module.less";

interface Props {
  isGroup: boolean;
}

export default function EditMultiCmps({isGroup}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const align = e.target.value;
    let newStyle: Style = {};
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
    editAssemblyStyle(newStyle);
  };

  return (
    <div className={styles.main}>
      <div className={styles.title}>批量修改多个组件属性</div>

      <Item label="对齐页面: ">
        <select className={styles.itemRight} onChange={handleChange}>
          <option>选择对齐页面方式--</option>
          <option value="left">左对齐</option>
          <option value="right">右对齐</option>
          <option value="x-center">水平居中</option>
          <option value="top">上对齐</option>
          <option value="bottom">下对齐</option>
          <option value="y-center">垂直居中</option>
        </select>
      </Item>

      {/* 如果目前只有一个组合组件被选中，则显示取消组合的按钮，如果当前有单个组件被选中，则显示组合 */}
      {isGroup ? (
        <button className={styles.group} onClick={cancelGroupCmps}>
          取消组合
        </button>
      ) : (
        <button className={styles.group} onClick={groupCmps}>
          组合
        </button>
      )}

      <p className={styles.red}>双击可编辑组合内组件</p>
    </div>
  );
}
