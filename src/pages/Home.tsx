import {useEffect, useState} from "react";
import {deleteCanvas, getCanvasList} from "../request/canvas";
import {Card, Space, Table, Button} from "antd";
import {Link, useNavigate} from "react-router-dom";
import {ICmp} from "../store/editStoreTypes";
import docCookies from "src/utils/cookies";

type ListItem = {
  id: number;
  title: string;
  content: string;
};
export default function Home() {
  const username = docCookies.getItem("name");

  const navigate = useNavigate();
  const logout = () => {
    docCookies.removeItem("sessionId");
    docCookies.removeItem("name");
    navigate("/login");
  };

  const [list, setList] = useState([]);

  const fresh = () => {
    getCanvasList("", (res: any) => {
      let data = res.content || [];
      data = data.filter(
        (item: ICmp) => item.id !== 23 && item.id !== 15 && item.id !== 17
      );
      setList(data);
    });
  };

  useEffect(() => {
    fresh();
  }, []);

  const del = (values: {id: number}) => {
    deleteCanvas(values, () => {
      alert("删除成功");
      fresh();
    });
  };

  const columns = [
    {
      title: "id",
      key: "id",
      render: (item: ListItem) => {
        return <Link to={"/edit?id=" + item.id}>{item.id}</Link>;
      },
    },
    {
      title: "标题",
      key: "title",
      render: (item: ListItem) => {
        const title = item.title || "未命名";
        return <Link to={"/edit?id=" + item.id}>{title}</Link>;
      },
    },

    {
      title: "动作",
      key: "action",
      render: (item: ListItem) => (
        <Space size="middle">
          <a
            target="_blank"
            href={"https://builder-lemon.vercel.app/?id=" + item.id}>
            线上查看（切移动端）
          </a>
          <Link to={"/edit?id=" + item.id}>编辑</Link>
          <Button onClick={() => del({id: item.id})}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space size="large">
        <Button onClick={logout}> {username} 退出登录 </Button>
      </Space>

      <Space size="middle">
        <Link to={"/edit"}>新增</Link>
      </Space>
      <Table
        columns={columns}
        dataSource={list}
        rowKey={(record: ListItem) => record.id}
      />
    </Card>
  );
}
