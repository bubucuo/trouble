import classNames from "classnames";
import styles from "./index.module.less";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import useEditStore from "src/store/editStore";
import {useCanvasId, useCanvasType} from "src/store/hooks";
import {useCanvasFromEditStore} from "src/store/editStoreHooks";
import {saveCanvas} from "src/request/canvas";

export default function Header() {
  const editStore = useEditStore();
  const canvas = useCanvasFromEditStore();
  const navigate = useNavigate();

  const id = useCanvasId();
  const type = useCanvasType();

  //页面的新增与编辑更新
  // 模板的更新
  const save = () => {
    saveCanvas(
      {
        id,
        content: JSON.stringify(canvas),
        title: canvas.title,
        type,
      },
      (res: any) => {
        alert("保存成功");
        if (id == null) {
          navigate("?id=" + res.id);
        }
      }
    );
  };

  // 页面存成模板，此时是新增模板
  const saveTemplate = () => {
    saveCanvas(
      {
        // id,
        content: JSON.stringify(canvas),
        title: canvas.title,
        type: "template",
      },
      (res: any) => {
        alert("保存成功");
        if (id == null) {
          navigate("?id=" + res.id);
        }
      }
    );
  };

  const emptyCanvas = () => {
    editStore.setCanvas(null);
  };

  const goPrevCanvasHistory = () => {
    editStore.goPrevCanvasHistory();
  };

  const goNextCanvasHistory = () => {
    editStore.goNextCanvasHistory();
  };

  console.log("tpl render"); //sy-log
  return (
    <div className={styles.main}>
      <div className={classNames(styles.item)}>
        <Link to="/list" className="red">
          查看列表
        </Link>
      </div>

      <div className={classNames(styles.item)} onClick={save}>
        <span
          className={classNames("iconfont icon-baocun", styles.icon)}></span>
        <span className={styles.txt}>保存</span>
      </div>

      {type === "content" && (
        <div className={classNames(styles.item)} onClick={saveTemplate}>
          <span
            className={classNames("iconfont icon-baocun", styles.icon)}></span>
          <span className={styles.txt}>保存成模板</span>
        </div>
      )}

      <div className={classNames(styles.item)} onClick={goPrevCanvasHistory}>
        <span
          className={classNames(
            "iconfont icon-chexiaofanhuichehuishangyibu",
            styles.icon
          )}></span>
        <span className={styles.txt}>上一步</span>
      </div>

      <div className={classNames(styles.item)} onClick={goNextCanvasHistory}>
        <span
          className={classNames(
            "iconfont icon-chexiaofanhuichehuishangyibu",
            styles.icon
          )}
          style={{transform: `rotateY{180}deg`}}></span>
        <span className={styles.txt}>下一步</span>
      </div>

      <div className={classNames(styles.item)} onClick={emptyCanvas}>
        <span
          className={classNames("iconfont icon-qingkong", styles.icon)}></span>
        <span className={styles.txt}>清空</span>
      </div>

      {/* <div className={classNames(styles.item)} onClick={save}>
        <span className={classNames("iconfont icon-fabu", styles.icon)}></span>
        <span className={styles.txt}>发布</span>
      </div> */}
    </div>
  );
}
