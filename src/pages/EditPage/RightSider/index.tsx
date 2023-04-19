import {useState} from "react";
import styles from "./index.module.less";

export default function RightSider() {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className={styles.main}>
      <div
        className={styles.switch}
        onClick={() => {
          setShowEdit(!showEdit);
        }}>
        {showEdit ? "隐藏编辑区域" : "显示编辑区域"}
      </div>
    </div>
  );
}
