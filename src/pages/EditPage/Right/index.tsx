import {useState} from "react";
import useEditStore, {IEditStore} from "src/store/editStore";
import EditCmp from "../EditCmp";
import EditCanvas from "../EditCanvas";
import styles from "./index.module.less";

export default function Right() {
  const editStore = useEditStore() as IEditStore;
  const selectedCmp = editStore.getSelectedCmp();

  const [showEdit, setShowEdit] = useState(true);

  return (
    <div className={styles.main}>
      <div
        className={styles.switch}
        onClick={() => {
          setShowEdit(!showEdit);
        }}>
        {showEdit ? "隐藏编辑区域" : "显示编辑区域"}
      </div>
      {showEdit && (selectedCmp ? <EditCmp /> : <EditCanvas />)}
    </div>
  );
}
