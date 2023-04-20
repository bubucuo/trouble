import {Button, Form, Input, Checkbox, Modal} from "antd";
import {useEffect} from "react";
import Axios from "src/request/axios";
import {registerEnd} from "src/request/end";
import useGlobalStore from "src/store/globalStore";
import useUserStore, {fetchUserInfo, login, logout} from "src/store/userStore";

export default function Login() {
  // 校验登录
  const {isLogin, name} = useUserStore();
  const loading = useGlobalStore((state) => state.loading);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  if (loading) {
    return;
  }

  // 用户已经登录，显示用户信息
  if (isLogin) {
    return (
      <Button style={{float: "right", marginTop: 16}} onClick={logout}>
        {name}退出登录
      </Button>
    );
  }
  // 用户没有登录，显示登录框
  const onFinish = ({
    name,
    password,
    register_login,
  }: {
    name: string;
    password: string;
    register_login: boolean;
  }) => {
    console.log("Success:", {name, password, register_login});

    if (register_login) {
      registerAndLogin({name, password});
    } else {
      login({name, password});
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const registerAndLogin = async (values: {name: string; password: string}) => {
    const res = await Axios.post(registerEnd, values);
    if (res) {
      login(values);
    }
  };

  return (
    <Modal title="注册与登录" open={true} closable={false} footer={[]}>
      <p className="red">登录之后才可使用~</p>
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off">
        <Form.Item
          label="用户名"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input your name!",
            },
          ]}>
          <Input />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}>
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="register_login"
          valuePropName="checked"
          wrapperCol={{offset: 7}}>
          <Checkbox className="red">注册并登录</Checkbox>
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
