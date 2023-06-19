import {useState} from "react";
import useEditStore from "src/store/editStore";
import EditCmp from "./EditCmp";
import EditCanvas from "./EditCanvas";
import EditMultiCmps from "./EditMultiCmps";
import styles from "./index.module.less";
import {isGroupComponent} from "src/utils/const";

// 画布
// 单个组件
// 多个组件
export default function RightSider() {
  const [showEdit, setShowEdit] = useState(false);

  const [canvas, assembly] = useEditStore((state) => [
    state.canvas,
    state.assembly,
  ]);

  const assemblySize = assembly.size;
  let selectedCmp;
  let isGroup = false;
  if (assemblySize === 1) {
    selectedCmp = canvas.content.cmps[Array.from(assembly)[0]];
    isGroup = !!(selectedCmp.type & isGroupComponent);
  }

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
          <EditCanvas canvas={canvas} />
        ) : assemblySize === 1 && !isGroup ? (
          <EditCmp
            selectedCmp={selectedCmp!}
            formKeys={canvas.content.formKeys}
          />
        ) : (
          <EditMultiCmps isGroup={isGroup} />
        ))}
    </div>
  );
}
