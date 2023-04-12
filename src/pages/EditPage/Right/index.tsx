import {useState} from "react";
import useEditStore, {selectedCmpSelector} from "src/store/editStore";
import EditCmp from "./EditCmp";
import EditCanvas from "./EditCanvas";
import styles from "./index.module.less";
import {assemblySelector} from "../../../store/editStore";
import EditMultiCmps from "./EditCmp/EditMultiCmps";

export default function Right() {
  const editStore = useEditStore();
  const assemblySize = assemblySelector(editStore).size;

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
      {showEdit &&
        (assemblySize === 0 ? (
          <EditCanvas />
        ) : assemblySize === 1 ? (
          <EditCmp />
        ) : (
          <EditMultiCmps />
        ))}
    </div>
  );
}
