import classNames from "classnames";
import {addAssemblyCmps, delSelectedCmps} from "src/store/editStore";
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
            <li>上移一层</li>
            <li>下移一层</li>
            <li>置顶</li>
            <li>置底</li>
          </>
        )}
      </ul>
    </div>
  );
}
