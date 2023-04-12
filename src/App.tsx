import {BrowserRouter as Router, Route, Routes, Outlet} from "react-router-dom";
import Login from "./components/Login";
import List from "./pages/List";
import Edit from "./pages/EditPage";
import docCookies from "./utils/cookies";
import styles from "./app.module.less";
import {useEffect, useState} from "react";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RequireAuth />}>
          <Route index element={<Edit />} />
          <Route path="list" element={<List />} />
        </Route>
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
  );
}

function RequireAuth() {
  const auth = docCookies.getItem("sessionId");

  return (
    <div className={styles.app}>
      <Outlet />
      {!auth && (
        <div className={styles.mask}>
          <div className={styles.login}>
            <Login />
          </div>
        </div>
      )}
    </div>
  );
}
