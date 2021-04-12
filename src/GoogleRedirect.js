import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Redirect } from "@reach/router";
import queryString from "query-string";

import { GOOGLE_CLIENT_ACCESS_TOKEN } from "./utils";

function GoogleRedirect({ token, setAccessToken, location }) {
  useEffect(() => {
    const tokenString = queryString.parse(location.hash).access_token;
    localStorage.setItem(GOOGLE_CLIENT_ACCESS_TOKEN, tokenString);
    setAccessToken(tokenString);
  }, [location.hash, setAccessToken]);

  return token ? <Redirect noThrow to="/" /> : null;
}

export default GoogleRedirect;

GoogleRedirect.propTypes = {
  token: PropTypes.string.isRequired,
  location: PropTypes.shape.isRequired,
  setAccessToken: PropTypes.func.isRequired,
};
