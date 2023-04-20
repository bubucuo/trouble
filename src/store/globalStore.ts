import {create} from "zustand";

interface GlobalStoreState {
  loading: boolean;
}

const useGlobalStore = create<GlobalStoreState>()(() => ({
  loading: false,
}));

export const showLoading = () => {
  useGlobalStore.setState({loading: true});
};

export const hideLoading = () => {
  useGlobalStore.setState({loading: false});
};

export default useGlobalStore;
