import styles from "./index.less";
import classNames from "classnames";
import useEditStore from "../../../../store/editStore";

export default function ContextMenu({style}: any) {
  // const editStore = useCanvasByContext();

  const editStore = useEditStore();

  const copy = (e) => {
    e.stopPropagation();
    editStore.addAssemblyCms();
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
  const hasAssembly = editStore.hasAssembly();
  return (
    <ul className={classNames(styles.main)} style={style}>
      <li className={styles.item} onClick={copy}>
        复制组件
      </li>
      <li className={styles.item} onClick={del}>
        删除组件
      </li>
      {!hasAssembly && (
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
