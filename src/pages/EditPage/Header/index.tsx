import classNames from "classnames";
import styles from "./index.module.less";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import useEditStore from "src/store/editStore";
import {useCanvasId, useCanvasType} from "src/store/hooks";
import {useCanvasFromEditStore} from "src/store/editStoreHooks";
import {saveCanvas} from "src/request/canvas";
import {isFunction} from "lodash";

export default function Header() {
  const editStore = useEditStore();
  const {goPrevCanvasHistory, goNextCanvasHistory} = editStore;
  const canvas = useCanvasFromEditStore();
  const navigate = useNavigate();

  const id = useCanvasId();
  const type = useCanvasType();

  //页面的新增与编辑更新
  // 模板的更新
  const save = (e, callback?: (_id: number) => void) => {
    saveCanvas(
      {
        id,
        content: JSON.stringify(canvas),
        title: canvas.title,
        type,
      },
      (res: any) => {
        if (isFunction(callback)) {
          callback(res.id);
        } else {
          alert("保存成功");
          if (id == null) {
            navigate("?id=" + res.id);
          }
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

  const saveAndPreview = (e) => {
    save(e, (_id: number) => {
      navigate("?id=" + _id);
      window.open("https://builder-lemon.vercel.app/?id=" + _id);
    });
  };

  const emptyCanvas = () => {
    editStore.setCanvas(null);
  };

  console.log("header render"); //sy-log
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
        {/* <span className={styles.shortKey}>Ctr+S</span> */}
      </div>

      {type === "content" && (
        <div className={classNames(styles.item)} onClick={saveTemplate}>
          <span
            className={classNames("iconfont icon-baocun", styles.icon)}></span>
          <span className={styles.txt}>保存成模板</span>
          {/* <span className={styles.shortKey}>Ctr+T</span> */}
        </div>
      )}

      <div className={classNames(styles.item)} onClick={saveAndPreview}>
        <span
          className={classNames("iconfont icon-baocun", styles.icon)}></span>
        <span className={styles.txt}>保存并预览</span>
        {/* <span className={styles.shortKey}>Ctr+P</span> */}
      </div>

      <div className={classNames(styles.item)} onClick={goPrevCanvasHistory}>
        <span
          className={classNames(
            "iconfont icon-chexiaofanhuichehuishangyibu",
            styles.icon
          )}></span>
        <span className={styles.txt}>上一步</span>
        <span className={styles.shortKey}>CMD+Z</span>
      </div>

      <div className={classNames(styles.item)} onClick={goNextCanvasHistory}>
        <span
          className={classNames(
            "iconfont icon-chexiaofanhuichehuishangyibu",
            styles.icon
          )}
          style={{transform: `rotateY{180}deg`}}></span>
        <span className={styles.txt}>下一步 </span>
        <span className={styles.shortKey}>CMD+Shift+Z</span>
      </div>

      <div className={classNames(styles.item)} onClick={emptyCanvas}>
        <span
          className={classNames("iconfont icon-qingkong", styles.icon)}></span>
        <span className={styles.txt}>清空</span>
      </div>
    </div>
  );
}
