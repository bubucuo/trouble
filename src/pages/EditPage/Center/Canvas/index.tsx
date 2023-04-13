import {_Style} from "src/store/editStoreTypes";
import styles from "./index.module.less";

export default function Canvas() {
  return (
    <div
      id="canvas"
      className={styles.main}
      style={{width: 320, height: 568}}></div>
  );
}
