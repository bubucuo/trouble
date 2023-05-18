import classNames from "classnames";
import {
  addAssemblyCmps,
  addZIndex,
  bottomZIndex,
  delSelectedCmps,
  subZIndex,
  topZIndex,
} from "src/store/editStore";
import styles from "./index.module.less";
import {Style} from "src/store/editStoreTypes";

export default function Menu({
  style,
  assemblySize,
}: {
  style: Style;
  assemblySize: number;
}) {
  if (assemblySize === 0) {
    return null;
  }

  return (
    <div className={classNames(styles.main)} style={style}>
      <ul className={classNames(styles.menu)}>
        <li onClick={addAssemblyCmps}>复制组件</li>
        <li onClick={delSelectedCmps}>删除组件</li>
        {assemblySize === 1 && (
          <>
            <li onClick={addZIndex}> 上移一层 CMD+↑</li>
            <li onClick={subZIndex}>下移一层 CMD+↓</li>
            <li onClick={topZIndex}>置顶</li>
            <li onClick={bottomZIndex}>置底</li>
          </>
        )}
      </ul>
    </div>
  );
}
