import React, { useEffect, useState } from "react";
import { Router } from "@reach/router";

import Map from "./Map";
import Login from "./Login";
import GoogleRedirect from "./GoogleRedirect";
import { GOOGLE_CLIENT_ACCESS_TOKEN } from "./utils";

function App() {
  const [accessToken, setAccessToken] = useState();

  useEffect(() => {
    const token = localStorage.getItem(GOOGLE_CLIENT_ACCESS_TOKEN);
    setAccessToken(token);
  }, []);

  return (
    <div>
      <Router>
        {accessToken && (
          <Map
            path="/"
            token={accessToken}
            removeToken={() => {
              localStorage.removeItem(GOOGLE_CLIENT_ACCESS_TOKEN);
              setAccessToken(null);
            }}
          />
        )}
        <Login path="/" />
        <GoogleRedirect
          path="/redirect"
          setAccessToken={setAccessToken}
          token={accessToken}
        />
      </Router>
    </div>
  );
}

export default App;
