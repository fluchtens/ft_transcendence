import { useEffect, useState } from "react";
import { updateAvatarApi, updateUsernameApi } from "../../services/user.api";
import { notifyError, notifySuccess } from "../../utils/notifications";
import { Separator } from "../../components/Separator";
import defaultAvatar from "/default_avatar.png";
import styles from "./ProfileSettings.module.scss";
import { useAuth } from "../../hooks/useAuth";
import { useChatSocket } from "../../hooks/useChatSocket";

function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const chatSocket = useChatSocket();

  const changeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const avatarSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          if (user) {
            user.avatar = reader.result as string;
          }
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const submitData = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username && user?.username !== username) {
      const { success, message } = await updateUsernameApi(username);
      const formatMessage = Array.isArray(message) ? message[0] : message;
      success ? notifySuccess(message) : notifyError(formatMessage);
    }

    if (file) {
      const { success, message } = await updateAvatarApi(file);
      success ? notifySuccess(message) : notifyError(message);
    }

    setFile(null);
    await refreshUser();
    chatSocket.emit("refreshUser");
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  return (
    <>
      {user && (
        <form className={styles.profileSettings}>
          <h1>Public profile</h1>
          <Separator />
          <div className={styles.dataToSubmit}>
            <div className={styles.inputText}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={changeUsername}
                placeholder="Enter a username"
                required
              />
              <p>Your username is your unique identifier on our platform.</p>
            </div>
            <div className={styles.inputFile}>
              <label>Profile picture</label>
              {file ? (
                <img src={URL.createObjectURL(file)} />
              ) : user.avatar ? (
                <img src={user.avatar} />
              ) : (
                <img src={defaultAvatar} />
              )}
              <label className={styles.chooseFile}>
                <input type="file" onChange={avatarSelection} />
                Edit
              </label>
            </div>
          </div>
          <button onClick={submitData}>Update profile</button>
        </form>
      )}
    </>
  );
}

export default ProfileSettings;
