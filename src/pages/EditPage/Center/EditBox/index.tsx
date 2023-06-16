import useEditStore, {
  recordCanvasChangeHistory_2,
  setCmpSelected,
  updateAssemblyCmpsByDistance,
  updateSelectedCmpAttr,
  updateSelectedCmpStyle,
} from "src/store/editStore";
import styles from "./index.module.less";
import {throttle} from "lodash";
import useZoomStore from "src/store/zoomStore";
import StretchDots from "./StretchDots";
import {isGroupComponent, isTextComponent} from "src/utils/const";
import {useEffect, useState} from "react";
import TextareaAutosize from "react-textarea-autosize";
import Menu from "../Menu";
import AlignLines from "./AlignLines";
import Rotate from "./Rotate";
import EditBoxOfMultiCmps from "./EditBoxOfMultiCmps";

export default function EditBox() {
  const zoom = useZoomStore((state) => state.zoom);
  const [canvas, assembly] = useEditStore((state) => [
    state.canvas,
    state.assembly,
  ]);

  const {cmps, style: canvasStyle} = canvas.content;
  const selectedIndex = Array.from(assembly)[0];

  useEffect(() => {
    setShowMenu(false);
  }, [selectedIndex]);

  // 只有单个文本组件的时候才会用到
  const selectedCmp = cmps[selectedIndex];
  const [textareaFocused, setTextareaFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const onMouseDownOfCmp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (textareaFocused) {
      return;
    }
    let startX = e.pageX;
    let startY = e.pageY;

    const move = throttle((e) => {
      const x = e.pageX;
      const y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      // 拖拽，允许自动调整
      updateAssemblyCmpsByDistance({top: disY, left: disX}, true);

      startX = x;
      startY = y;
    }, 50);

    const up = () => {
      // 隐藏吸附线
      document.querySelectorAll(".alignLine").forEach((element) => {
        (element as HTMLElement).style.display = "none";
      });
      recordCanvasChangeHistory_2();
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const doubleClickEditBox = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedCmp.type & isGroupComponent) {
      // 组合组件
      // 此时根据位置计算想要选中的组件是谁
      const canvasDomPos = {
        top: 114 + 1,
        left:
          document.body.clientWidth / 2 -
          ((canvasStyle.width + 2) / 2) * (zoom / 100),
      };

      const relativePosition = {
        top: e.pageY - canvasDomPos.top,
        left: e.pageX - canvasDomPos.left,
      };
      const len = cmps.length;
      for (let i = len - 1; i >= 0; i--) {
        const cmp = cmps[i];
        if (cmp.groupKey !== selectedCmp.key) {
          continue;
        }
        let {top, left, width, height} = cmps[i].style;

        const right = left + width,
          bottom = top + height;
        if (
          relativePosition.top >= top &&
          relativePosition.top <= bottom &&
          relativePosition.left >= left &&
          relativePosition.left <= right
        ) {
          // 选中子节点
          setCmpSelected(i);
          return;
        }
      }
      // 检查这个点是否在子组件范围内
    } else if (selectedCmp.type & isTextComponent) {
      setTextareaFocused(true);
    }
  };

  const size = assembly.size;
  if (size === 0) {
    return null;
  }

  if (size > 1) {
    return (
      <EditBoxOfMultiCmps
        onMouseDownOfCmp={onMouseDownOfCmp}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
      />
    );
  }

  let {top, left, width, height} = selectedCmp.style;

  const transform = `rotate(${
    size === 1 ? selectedCmp.style.transform : 0
  }deg)`;

  // 边框加在外层
  width += 4;
  height += 4;

  return (
    <>
      <AlignLines canvasStyle={canvasStyle} />
      <div
        className={styles.main}
        style={{
          zIndex: 99999,
          top,
          left,
          width,
          height,
          transform,
        }}
        onMouseDown={onMouseDownOfCmp}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onDoubleClick={doubleClickEditBox}
        onContextMenu={() => {
          setShowMenu(true);
        }}
        onMouseLeave={() => {
          setTextareaFocused(false);
          setShowMenu(false);
        }}>
        {selectedCmp.type === isTextComponent && textareaFocused && (
          <TextareaAutosize
            value={selectedCmp.value}
            style={{
              ...selectedCmp.style,
              // 为了和下面字体重合，2是border宽度
              top: 0,
              left: 0,
            }}
            onChange={(e) => {
              const newValue = e.target.value;
              updateSelectedCmpAttr("value", newValue);
            }}
            onHeightChange={(height) => {
              updateSelectedCmpStyle({height});
            }}
          />
        )}

        {showMenu && (
          <Menu
            style={{
              left: width - 2,
              transform: `rotate(${
                size === 1 ? -selectedCmp.style.transform : 0
              }deg)`,
              transformOrigin: "0% 0%",
            }}
            assemblySize={size}
            cmps={cmps}
            selectedIndex={Array.from(assembly)[0]}
          />
        )}

        <StretchDots zoom={zoom} style={{width, height}} />
        {selectedCmp.type !== isGroupComponent && (
          <Rotate zoom={zoom} selectedCmp={selectedCmp} />
        )}
      </div>
    </>
  );
}
