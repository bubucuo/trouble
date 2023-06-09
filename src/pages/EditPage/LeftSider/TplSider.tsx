import {useEffect, useState} from "react";
import {addCanvasByTpl} from "src/store/editStore";
import Axios from "src/request/axios";
import {getTemplateListEnd} from "src/request/end";
import leftSideStyles from "./leftSide.module.less";
import {settings} from "./tpl";
import {Image} from "antd";

const TplSider = () => {
  const [list, setList] = useState([]);

  const fresh = async () => {
    const res: any = await Axios.get(getTemplateListEnd);
    let data = res?.content || [];
    setList(data);
  };
  useEffect(() => {
    fresh();
  }, []);

  console.log("TplSider render"); //sy-log
  return (
    <div className={leftSideStyles.main}>
      <ul className={leftSideStyles.box}>
        {settings.map((item: any) => (
          <li
            className={leftSideStyles.item}
            key={item.id}
            onClick={() => {
              addCanvasByTpl(item);
            }}>
            <div className={leftSideStyles.desc}>{item.title}</div>
            <img src={item.thumbnail?.header} alt={item.title} />
          </li>
        ))}
        {list.map((item: any) => (
          <li
            className={leftSideStyles.item}
            key={item.id}
            onClick={() => {
              addCanvasByTpl(item);
            }}>
            <div className={leftSideStyles.desc}>{item.title}</div>
            <Image
              preview={false}
              src={item.thumbnail?.full}
              fallback="https://www.bubucuo.cn/react-head.png"
              height={120}
              alt={item.title}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TplSider;
