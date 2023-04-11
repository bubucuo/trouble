import React, {Component} from "react";
// import {CanvasContext} from "@/src/Context";

import Text from "../Text";
import Img from "../Img";
import Lines from "../EditLine/Lines";
import {ICmp} from "src/store/canvas";

import styles from "./index.module.less";
import {isImgComponent, isTextComponent} from "../Left";
import {IEditStore} from "src/store/editStore";

// todo 拖拽、删除、改变层级关系等

interface ICmpProps {
  cmp: ICmp;
  index: number;
  editStore: IEditStore;
}

// 按键小幅度移动的事件写在了Center中
export default class Cmp extends Component<ICmpProps> {
  setSelected = (e: React.MouseEvent<HTMLDivElement>) => {
    //
    if (e.metaKey) {
      // 把选中的组件填入组件集合
      this.props.editStore.addAndUpdateAssembly(this.props.index);
    } else {
      this.props.editStore.setSelectedCmpIndex(this.props.index);
    }
  };

  render() {
    const {cmp, index} = this.props;
    const {style} = cmp;

    const {width, height} = style;
    const transform = `rotate(${style.transform}deg)`;

    const zIndex = index;

    const belongingToAssembly = this.props.editStore.belongingToAssembly(index);

    const innerWidth = style.width - (style.borderWidth || 0) * 2;
    const innerHeight = style.height - (style.borderWidth || 0) * 2;

    const selectedIndex = this.props.editStore.getSelectedCmpIndex();
    return (
      <div
        id={cmp.key + ""}
        className={styles.main}
        style={{
          ...style,
          transform,
          zIndex,
        }}
        onClick={this.setSelected}>
        {selectedIndex !== index && belongingToAssembly && (
          <Lines
            style={{width, height, transform}}
            basePos={style.borderWidth}
          />
        )}

        {/* 组件本身 , 注意如果是文本组件 ，如果处于选中状态，则目前处理是，textarea与这里的div Text重叠*/}
        <div
          className={styles.cmp}
          style={{
            width: innerWidth,
            height: innerHeight,
          }}>
          {cmp.type === isTextComponent && <Text {...cmp} />}
          {cmp.type === isImgComponent && <Img {...cmp} />}
        </div>
      </div>
    );
  }
}
