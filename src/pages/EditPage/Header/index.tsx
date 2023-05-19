import classNames from "classnames";
import {Link, useNavigate} from "react-router-dom";
import styles from "./index.module.less";
import {clearCanvas, saveCanvas} from "src/store/editStore";
import {message} from "antd";
import {goNextCanvasHistory, goPrevCanvasHistory} from "src/store/historySlice";
import {useEffect} from "react";

export default function Header() {
  const navigate = useNavigate();

  useEffect(() => {
    document.addEventListener("keydown", keyDown);
    return () => {
      document.removeEventListener("keydown", keyDown);
    };
  }, []);

  const keyDown = (e: any) => {
    if ((e.target as Element).nodeName === "TEXTAREA") {
      return;
    }
    // CMD + key
    if (e.metaKey) {
      switch (e.code) {
        // 撤销、回退
        case "KeyZ":
          if (e.shiftKey) {
            goNextCanvasHistory();
          } else {
            goPrevCanvasHistory();
          }
          return;

        case "KeyS":
          e.preventDefault();
          save();
          return;
      }
    }
  };

  //页面的新增与编辑更新
  const save = () => {
    saveCanvas((_id, isNew) => {
      message.success("保存成功");
      if (isNew) {
        // 新增
        navigate(`?id=${_id}`);
      }
    });
  };

  const saveAndPreview = () => {
    saveCanvas((_id, isNew) => {
      message.success("保存成功");

      if (isNew) {
        // 新增
        navigate(`?id=${_id}`);
      }

      // 跳转生成器项目页
      window.open("http://builder.codebus.tech?id=" + _id);
    });
  };

  const emptyCanvas = () => {
    clearCanvas();
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
        <span className={styles.shortKey}>CMD+S</span>
      </div>

      <div className={classNames(styles.item)} onClick={saveAndPreview}>
        <span
          className={classNames("iconfont icon-baocun", styles.icon)}></span>
        <span className={styles.txt}>保存并预览</span>
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
