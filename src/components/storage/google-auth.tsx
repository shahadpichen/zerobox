import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";
import { Button } from "../ui/button";
import { clearStoredKey } from "../../utils/cryptoUtils";
import { useNavigate } from "react-router-dom";

interface GoogleAuthProps {
  onAuthChange: (authenticated: boolean) => void;
  padding: number;
  content: string;
  text: string;
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({
  onAuthChange,
  content,
  padding,
  text,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          clientId: process.env.REACT_APP_PUBLIC_CLIENT_ID,
          scope: process.env.REACT_APP_PUBLIC_SCOPE,
        })
        .then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          const isSignedIn = authInstance.isSignedIn.get();
          setIsAuthenticated(isSignedIn);
          onAuthChange(isSignedIn);

          if (isSignedIn) {
            localStorage.setItem("isAuthenticated", "true");
            navigate("/storage");
          } else {
            localStorage.removeItem("isAuthenticated");
            navigate("/");
          }

          authInstance.isSignedIn.listen((signedIn) => {
            setIsAuthenticated(signedIn);
            onAuthChange(signedIn);

            if (signedIn) {
              localStorage.setItem("isAuthenticated", "true");
              navigate("/storage");
            } else {
              localStorage.removeItem("isAuthenticated");
              navigate("/");
            }
          });
        });
    };
    gapi.load("client:auth2", initClient);

    const storedAuthState = localStorage.getItem("isAuthenticated");
    if (storedAuthState === "true") {
      setIsAuthenticated(true);
      onAuthChange(true);
    }
  }, [onAuthChange, navigate]);

  const handleLogin = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
    setIsAuthenticated(false);
    onAuthChange(false);
    clearStoredKey();
  };

  return (
    <>
      {isAuthenticated ? (
        <Button onClick={handleLogout}>Logout</Button>
      ) : (
        <Button
          onClick={handleLogin}
          className={`bg-blue-500 hover:bg-blue-600 p-${padding} text-${text}`}
        >
          {content}
        </Button>
      )}
    </>
  );
};
