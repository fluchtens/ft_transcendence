import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./layouts/layout/Layout";
import Error from "./components/Error";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Setup from "./pages/auth/Setup";
import Profile from "./pages/user/Profile";
import Chat from "./pages/chat/Chat";
import Settings from "./pages/settings/Settings";
import TwoFaAuth from "./pages/auth/TwoFaAuth";
import { AuthProvider } from "./utils/useAuth";
import GameElement from "./components/GameElement";
import { ChatSocketProvider } from "./utils/useChatSocket";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <Error />,
      children: [
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/register/setup",
          element: <Setup />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/login/twofa",
          element: <TwoFaAuth />,
        },
        {
          path: "/user/:username",
          element: <Profile />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },

        {
          path: "/game",
          element: <GameElement />,
        },
        {
          path: "/chat/:id",
          element: <Chat />,
        },
      ],
    },
  ]);
  return (
    <>
      <AuthProvider>
        <ChatSocketProvider>
          <RouterProvider router={router} />
        </ChatSocketProvider>
      </AuthProvider>
    </>
  );
}

export default App;
