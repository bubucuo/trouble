import {create} from "zustand";
import {immer} from "zustand/middleware/immer";

let referenceLinesCount = 0;

interface referenceLineX {
  key: string;
  top: number | string;
}
interface referenceLineY {
  key: string;
  left: number | string;
}
interface IZoomStore {
  zoom: number; // 缩放比例
  referenceLinesX: Array<referenceLineX>;
  referenceLinesY: Array<referenceLineY>;

  zoomOut: () => void;
  zoomIn: () => void;
  setZoom: (_zoom: number) => void;

  addReferenceLineX: () => void;
  setReferenceLineX: (index: number, top: number) => void;
  clearReferenceLineX: (index: number, key: string) => void;

  addReferenceLineY: () => void;
  setReferenceLineY: (index: number, left: number) => void;
  clearReferenceLineY: (index: number, key: string) => void;

  clearReferenceLine: () => void;
}

const useZoomStore = create(
  immer<IZoomStore>((set) => ({
    zoom: 100,
    referenceLinesX: [],
    referenceLinesY: [],

    zoomOut: () =>
      set((draft) => {
        draft.zoom += 25;
      }),
    zoomIn: () =>
      set((draft) => {
        if (draft.zoom - 25 < 1) {
          draft.zoom -= 1;
        } else {
          draft.zoom -= 25;
        }
      }),

    setZoom: (_zoom: any) => {
      if (parseInt(_zoom) >= 1) {
        set((draft) => {
          draft.zoom = parseInt(_zoom);
        });
      }
    },

    // 横线
    addReferenceLineX: () => {
      set((draft) => {
        draft.referenceLinesX.push({
          key: "referenceLine" + referenceLinesCount++,
          top: "50%",
        });
      });
    },
    setReferenceLineX: (index, value) => {
      set((draft) => {
        draft.referenceLinesX[index as number].top = value;
      });
    },

    clearReferenceLineX: (index, key) => {
      set((draft) => {
        draft.referenceLinesX = draft.referenceLinesX.filter(
          (item, i) => !(i === index && item.key === key)
        );
      });
    },

    // 竖线
    addReferenceLineY: () => {
      set((draft) => {
        draft.referenceLinesY.push({
          key: "referenceLine" + referenceLinesCount++,
          left: "50%",
        });
      });
    },
    setReferenceLineY: (index, value) => {
      set((draft) => {
        draft.referenceLinesY[index as number].left = value;
      });
    },

    clearReferenceLineY: (index, key) => {
      set((draft) => {
        draft.referenceLinesY = draft.referenceLinesY.filter(
          (item, i) => !(i === index && item.key === key)
        );
      });
    },

    clearReferenceLine: () => {
      set((draft) => {
        draft.referenceLinesX = [];
        draft.referenceLinesY = [];
      });
    },
  }))
);

export const resetZoom = () => {
  useZoomStore.setState({zoom: 100});
};

export default useZoomStore;
