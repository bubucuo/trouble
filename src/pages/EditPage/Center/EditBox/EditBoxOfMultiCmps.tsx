import useEditStore from "src/store/editStore";
import styles from "./index.module.less";
import useZoomStore from "src/store/zoomStore";
import StretchDots from "./StretchDots";
import Menu from "../Menu";
import {computeBoxStyle} from "src/utils";

interface Props {
  onMouseDownOfCmp: (e: React.MouseEvent<HTMLDivElement>) => void;
  showMenu: boolean;
  setShowMenu: (showMenu: boolean) => void;
}

export default function EditBoxOfMultiCmps({
  onMouseDownOfCmp,
  showMenu,
  setShowMenu,
}: Props) {
  const zoom = useZoomStore((state) => state.zoom);
  const [canvas, assembly] = useEditStore((state) => [
    state.canvas,
    state.assembly,
  ]);

  const {cmps} = canvas.content;

  const size = assembly.size;
  if (size === 0) {
    return null;
  }

  let {top, left, width, height} = computeBoxStyle(cmps, assembly);
  width += 4;
  height += 4;

  return (
    <>
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
        onContextMenu={() => {
          setShowMenu(true);
        }}
        onMouseLeave={() => {
          setShowMenu(false);
        }}>
        {showMenu && (
          <Menu
            style={{left: width - 2}}
            assemblySize={size}
            cmps={cmps}
            selectedIndex={Array.from(assembly)[0]}
          />
        )}
        <StretchDots zoom={zoom} style={{width, height}} />
      </div>
    </>
  );
}
