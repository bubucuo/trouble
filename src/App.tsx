import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Edit from "./pages/EditPage";
import docCookies from "./utils/cookies";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route
            path="/edit"
            element={
              <RequireAuth>
                <Edit />
              </RequireAuth>
            }
          />
        </Route>
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
  );
}

function RequireAuth({children}: {children: JSX.Element}) {
  let auth = docCookies.getItem("sessionId");

  let location = useLocation();

  if (!auth) {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  return children;
}
