import classNames from "classnames";
import useEditStore from "src/store/editStore";
import styles from "./index.module.less";
import {useAssemblyFromEditStore} from "src/store/editHooks";

export default function ContextMenu({style}: any) {
  const editStore = useEditStore();

  const copy = (e) => {
    e.stopPropagation();
    editStore.addAssemblyCmp();
  };

  const del = (e) => {
    e.stopPropagation();
    editStore.deleteCmps();
  };

  const addCmpZIndex = (e) => {
    e.stopPropagation();
    editStore.addCmpZIndex();
  };

  const subCmpZIndex = (e) => {
    e.stopPropagation();
    editStore.subCmpZIndex();
  };

  const topZIndex = (e) => {
    e.stopPropagation();
    editStore.topZIndex();
  };

  const bottomZIndex = (e) => {
    e.stopPropagation();
    editStore.bottomZIndex();
  };
  const assembly = useAssemblyFromEditStore();

  const assemblySize = assembly.size;
  if (assemblySize === 0) {
    return null;
  }
  return (
    <ul className={classNames(styles.main)} style={style}>
      <li className={styles.item} onClick={copy}>
        复制组件
      </li>
      <li className={styles.item} onClick={del}>
        删除组件
      </li>
      {assemblySize === 1 && (
        <>
          <li className={styles.item} onClick={addCmpZIndex}>
            上移一层
          </li>
          <li className={styles.item} onClick={subCmpZIndex}>
            下移一层
          </li>
          <li className={styles.item} onClick={topZIndex}>
            置顶
          </li>
          <li className={styles.item} onClick={bottomZIndex}>
            置底
          </li>
        </>
      )}
    </ul>
  );
}
