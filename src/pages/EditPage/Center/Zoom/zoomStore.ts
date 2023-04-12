import {create} from "zustand";
import {immer} from "zustand/middleware/immer";

interface IZoomStore {
  zoom: number;
  zoomOut: () => void;
  zoomIn: () => void;
  setZoom: (_zoom: number) => void;
}

const useZoomStore = create(
  immer<IZoomStore>((set) => ({
    zoom: 100,
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
  }))
);

export default useZoomStore;
