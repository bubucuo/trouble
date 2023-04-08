import {useState} from "react";
import styles from "./index.module.less";
import useEditStore from "../../../store/editStore";
import EditCmp from "../EditCmp";
import EditCanvas from "../EditCanvas";

export default function Right() {
  const canvas = useEditStore(); // useCanvasByContext();
  const selectedCmp = canvas.getSelectedCmp();

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
