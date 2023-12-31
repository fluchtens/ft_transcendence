import { useState } from "react";
import { useChatSocket } from "../hooks/useChatSocket";
import { blockUserApi, removeFriendApi } from "../services/friendship.api";
import { Channel } from "../types/chat.interface";
import { User } from "../types/user.interface";
import { notifyError, notifySuccess } from "../utils/notifications";
import styles from "./UserContextMenu.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { MuteUser } from "../pages/chat/actions/MuteUser";

export enum ContextMenuType {
  FRIEND = "FRIEND",
  REQUEST = "REQUEST",
  MEMBER = "MEMBER",
}

interface UserContextMenuProps {
  user: User;
  userRole?: string;
  type: ContextMenuType;
  channel?: Channel;
  cb: () => void;
}

const UserContextMenu = ({
  user,
  userRole,
  type,
  channel,
  cb,
}: UserContextMenuProps) => {
  const [muteModal, setMuteModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const chatSocket = useChatSocket();

  const openMuteModalModal = () => {
    setMuteModal(true);
  };

  const closeMuteModal = () => {
    setMuteModal(false);
  };

  const removeFriend = async () => {
    cb();
    const { success, message } = await removeFriendApi(user.id);
    success ? notifySuccess(message) : notifyError(message);
  };

  const blockUser = async () => {
    cb();
    const { success, message } = await blockUserApi(user.id);
    success ? notifySuccess(message) : notifyError(message);
  };

  const sendPrivateMessage = async () => {
    cb();
    chatSocket.emit("privateMessage", user.id, (channelId: string) => {
      if (channelId) {
        navigate("/pm/" + channelId);
        notifySuccess("You has joined the private chat");
      }
    });
  };

  const promoteOwner = async () => {
    cb();
    if (channel) {
      chatSocket.emit(
        "changeRole",
        { channelId: channel.id, memberId: user.id, newRole: "OWNER" },
        (result: string) => {
          if (!result) {
            notifySuccess("Successfully promoted to owner");
          } else {
            notifyError("Failed to promote to owner");
          }
        }
      );
    }
  };

  const promoteAdmin = async () => {
    cb();
    if (channel) {
      chatSocket.emit(
        "changeRole",
        { channelId: channel.id, memberId: user.id, newRole: "ADMIN" },
        (result: string) => {
          if (!result) {
            notifySuccess("Successfully promoted to owner");
          } else {
            notifyError("Failed to promote to admin");
          }
        }
      );
    }
  };

  const demoteUser = async () => {
    cb();
    if (channel) {
      chatSocket.emit(
        "changeRole",
        { channelId: channel.id, memberId: user.id, newRole: "GUEST" },
        (result: string) => {
          if (!result) {
            notifySuccess("Successfully demoted to user");
          } else {
            notifyError("Failed to demote user");
          }
        }
      );
    }
  };

  const kickUser = async () => {
    cb();
    if (channel) {
      chatSocket.emit(
        "kickUser",
        { channelId: channel.id, userIdKick: user.id },
        (result: string) => {
          if (result) {
            notifyError("Failed to kick user");
          } else {
            notifySuccess("The user was successful kicked");
          }
        }
      );
    }
  };

  const banUser = async () => {
    cb();
    if (channel) {
      chatSocket.emit(
        "banUser",
        { channelId: channel.id, userIdToBan: user.id },
        (result: string) => {
          if (result) {
            notifyError("Failed to ban user");
          } else {
            notifySuccess("The user was successful banned");
          }
        }
      );
    }
  };

  const renderButtons = () => {
    switch (type) {
      case ContextMenuType.FRIEND:
        return (
          <>
            <button onClick={removeFriend}>Remove friend</button>
          </>
        );
      case ContextMenuType.REQUEST:
        return null;
      case ContextMenuType.MEMBER:
        if (userRole && userRole === "OWNER") {
          return (
            <>
              <button onClick={promoteOwner}>Promote to owner rank</button>
              <button onClick={promoteAdmin}>Promote to admin rank</button>
              <button onClick={demoteUser}>Demote to user rank</button>
              <button onClick={kickUser}>Kick user</button>
              <button onClick={banUser}>Ban user</button>
              <button onClick={openMuteModalModal}>Mute user</button>
            </>
          );
        } else if (userRole && userRole === "ADMIN") {
          return (
            <>
              <button onClick={kickUser}>Kick user</button>
              <button onClick={banUser}>Ban user</button>
              <button onClick={openMuteModalModal}>Mute user</button>
            </>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Link className={styles.link} to={`/user/${user.username}`} onClick={cb}>
        View user profile
      </Link>
      <button onClick={sendPrivateMessage}>Send private message</button>
      <button onClick={blockUser}>Block all communication</button>
      {renderButtons()}
      {muteModal && channel && (
        <MuteUser
          user={user}
          channel={channel}
          closeModal={closeMuteModal}
          cb={cb}
        />
      )}
    </div>
  );
};

export { UserContextMenu };
