import {Layout, Spin} from "antd";
import Login from "./Login";
import {Outlet} from "react-router-dom";
import useGlobalStore from "src/store/globalStore";

const {Header} = Layout;

export default function RequireAuth() {
  const loading = useGlobalStore((state) => state.loading);

  const headerStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#fff",
    height: 64,
    paddingInline: 10,
    lineHeight: "64px",
    backgroundColor: "black",
  };

  return (
    <Layout>
      {loading && (
        <div className="loading">
          <Spin size="large" />
        </div>
      )}

      <Header style={headerStyle}>
        <Login />
      </Header>

      <Outlet />
    </Layout>
  );
}
