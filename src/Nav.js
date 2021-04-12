import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  nav: {
    background: "#607d8b",
  },
  title: {
    flexGrow: 1,
  },
  logo: {
    width: theme.spacing(15),
  },
}));

function Nav({ removeToken }) {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar className={classes.nav}>
        <div className={classes.title}>
          <img
            className={classes.logo}
            src="/fa-logo.png"
            alt="Fresh Approach Logo"
          />
        </div>
        <Button color="inherit" onClick={removeToken}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Nav;

Nav.propTypes = {
  removeToken: PropTypes.func.isRequired,
};
