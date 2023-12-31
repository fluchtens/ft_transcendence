import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Home from "../../pages/home/Home";
import Header from "../header/Header";
import Friends from "../../pages/friends/Friends";
import Channels from "../../pages/channels/Channels";
import { Notify, notifyError } from "../../utils/notifications";
import styles from "./Layout.module.scss";
import friendStyles from "../friends/Friends.module.scss";
import channelStyles from "../channels/Channels.module.scss";
import { useAuth } from "../../hooks/useAuth";
import { useEffect } from "react";

function Layout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isHomePage = () => {
    return pathname === "/";
  };

  const isAuthPage = () => {
    const authPages = ["/login", "/register"];
    return authPages.some((authPage) => pathname.startsWith(authPage));
  };

  const isChannelOrFriendsPage = () => {
    const allowedPages = ["/channels", "/friends"];
    return allowedPages.includes(pathname);
  };

  useEffect(() => {
    if (user === null && !isAuthPage() && !isHomePage()) {
      navigate("/login");
      notifyError("You must be logged in to access this page.");
      return;
    }
    if (user && isAuthPage()) {
      navigate("/");
      notifyError("You are already logged in");
      return;
    }
  }, [user, pathname]);

  return (
    <div className={styles.container}>
      {!isAuthPage() && <Header />}
      <div className={styles.main}>
        {!isAuthPage() && !isChannelOrFriendsPage() && (
          <Channels styles={channelStyles} />
        )}
        <main>{isHomePage() ? <Home /> : <Outlet />}</main>
        {!isAuthPage() && !isChannelOrFriendsPage() && (
          <Friends styles={friendStyles} />
        )}
      </div>
      <Notify />
    </div>
  );
}

export default Layout;
