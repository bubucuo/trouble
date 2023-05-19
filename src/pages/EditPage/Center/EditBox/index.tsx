import useEditStore, {
  recordCanvasChangeHistory_2,
  updateAssemblyCmpsByDistance,
  updateSelectedCmpAttr,
  updateSelectedCmpStyle,
} from "src/store/editStore";
import styles from "./index.module.less";
import {throttle} from "lodash";
import useZoomStore from "src/store/zoomStore";
import StretchDots from "./StretchDots";
import {isTextComponent} from "../../LeftSider";
import {useEffect, useState} from "react";
import TextareaAutosize from "react-textarea-autosize";
import Menu from "../Menu";

export default function EditBox() {
  const zoom = useZoomStore((state) => state.zoom);
  const [cmps, assembly] = useEditStore((state) => [
    state.canvas.content.cmps,
    state.assembly,
  ]);

  const selectedIndex = Array.from(assembly)[0];

  useEffect(() => {
    setShowMenu(false);
  }, [selectedIndex]);

  // 只有单个文本组件的时候才会用到
  const selectedCmp = cmps[selectedIndex];
  const [textareaFocused, setTextareaFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const onMouseDownOfCmp = (e) => {
    let startX = e.pageX;
    let startY = e.pageY;

    const move = throttle((e) => {
      const x = e.pageX;
      const y = e.pageY;

      let disX = x - startX;
      let disY = y - startY;

      disX = disX * (100 / zoom);
      disY = disY * (100 / zoom);

      updateAssemblyCmpsByDistance({top: disY, left: disX});

      startX = x;
      startY = y;
    }, 50);

    const up = () => {
      recordCanvasChangeHistory_2();
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const size = assembly.size;
  if (size === 0) {
    return null;
  }

  let top = 9999,
    left = 9999,
    bottom = -9999,
    right = -9999;

  assembly.forEach((index) => {
    const cmp = cmps[index];
    top = Math.min(top, cmp.style.top);
    left = Math.min(left, cmp.style.left);

    bottom = Math.max(bottom, cmp.style.top + cmp.style.height);
    right = Math.max(right, cmp.style.left + cmp.style.width);
  });

  let width = right - left + 8;
  let height = bottom - top + 8;

  top -= 4;
  left -= 4;

  return (
    <div
      className={styles.main}
      style={{
        zIndex: 99999,
        top,
        left,
        width,
        height,
      }}
      onMouseDown={onMouseDownOfCmp}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onDoubleClick={() => {
        setTextareaFocused(true);
      }}
      onContextMenu={() => {
        setShowMenu(true);
      }}
      onMouseLeave={() => {
        setTextareaFocused(false);
        setShowMenu(false);
      }}>
      {size === 1 &&
        selectedCmp.type === isTextComponent &&
        textareaFocused && (
          <TextareaAutosize
            value={selectedCmp.value}
            style={{
              ...selectedCmp.style,
              top: 2,
              left: 2,
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
          style={{left: width}}
          assemblySize={size}
          cmps={cmps}
          selectedIndex={Array.from(assembly)[0]}
        />
      )}

      <StretchDots zoom={zoom} style={{width, height}} />
    </div>
  );
}
