import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.scss";
import { authUserTwoFa } from "../../services/auth.api";
import { getUser } from "../../services/user.api";
import { MainTitle } from "../../components/MainTitle";

function TwoFaAuth() {
  const [token, setToken] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const changeToken = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const submitData = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = await authUserTwoFa(token);
    if (!data.success) {
      setErrorMessage(data.message);
      return;
    }

    navigate("/");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const data = await getUser();
      if (data) {
        navigate("/");
      }
    };
    checkAuth();
  }, []);

  return (
    <div className={styles.container}>
      <MainTitle />
      <form className={styles.form} onSubmit={submitData}>
        <h1>Two-factor authentication</h1>
        <p>
          Open your two-factor authenticator app to view your authentication
          code.
        </p>
        {errorMessage && (
          <div className={styles.error}>
            <p>
              {Array.isArray(errorMessage) ? errorMessage[0] : errorMessage}
            </p>
          </div>
        )}
        <div className={styles.input}>
          <label>Authentication code :</label>
          <input
            type="text"
            value={token}
            onChange={changeToken}
            placeholder="XXXXXX"
            required
          />
        </div>
        <div className={styles.submitBtn}>
          <button type="submit">Continue</button>
        </div>
      </form>
    </div>
  );
}

export default TwoFaAuth;