import leftSideStyles from "../leftSide.module.less";
import classNames from "classnames";
import {cloneDeep} from "lodash";
import {useEffect, useState} from "react";
import {getTemplateList} from "src/request/canvas";
import useEditStore from "src/store/editStore";
import {settings} from "./tpl";

export default function TplSide() {
  const [list, setList] = useState([]);

  const editStore = useEditStore();

  const setCanvas = (_canvas: any, options: {title: string}) => {
    editStore.setCanvas({..._canvas, title: options.title});
  };

  useEffect(() => {
    getTemplateList("", (res: any) => {
      let data = res.content || [];
      setList(data);
    });
  }, []);

  return (
    <div className={classNames(leftSideStyles.main)}>
      <ul className={classNames(leftSideStyles.box)}>
        {settings.map((item: any) => (
          <li
            className={leftSideStyles.item}
            key={item.id}
            onClick={() => {
              setCanvas(item.data, {title: item.title});
            }}>
            <div className={leftSideStyles.desc}>{item.title}</div>
            <img src={item.img} alt={item.title} />
          </li>
        ))}
        {list.map((item: any) => (
          <li
            className={leftSideStyles.item}
            key={item.id}
            onClick={() => {
              // setCanvas(item.data, {title: item.title})
              setCanvas(JSON.parse(item.content), {title: item.title});
            }}
            // onClick={() => setCanvas(item.data, {title: item.title})}
          >
            <div className={leftSideStyles.desc}>{item.title}</div>
            <img
              src={
                item.thumbnail?.header ||
                "https://www.bubucuo.cn/react-head.png"
              }
              alt={item.title}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
