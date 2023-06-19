import Axios from "src/request/axios";
import {getUserInfo, loginEnd, logoutEnd} from "src/request/end";
import docCookies from "src/utils/cookies";
import {create} from "zustand";

interface UserStoreState {
  isLogin: boolean;
  name: string;
}

const initialState: UserStoreState = {isLogin: false, name: ""};

const useUserStore = create<UserStoreState>()(() => ({...initialState}));

// 获取用户信息
export const fetchUserInfo = async () => {
  let user = {...initialState};

  const res = await Axios.get(getUserInfo);
  if (res) {
    user = {isLogin: true, name: res.data.name};
  }

  useUserStore.setState(() => user);
};

// 登录
export const login = async (values: {name: string; password: string}) => {
  let user = {...initialState};

  const res: any = await Axios.post(loginEnd, values);
  if (res) {
    user = {isLogin: true, name: res.name};
    docCookies.setItem("sessionId", res.sessionId);
  }

  useUserStore.setState(user);
};

export const logout = async () => {
  let user = {...initialState};

  await Axios.post(logoutEnd);
  docCookies.removeItem("sessionId");

  useUserStore.setState(user);
};

export default useUserStore;
