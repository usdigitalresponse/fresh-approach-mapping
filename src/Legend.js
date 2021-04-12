import React from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  legendContainer: {
    marginBottom: theme.spacing(2),
  },
  legendCaptions: {
    display: "flex",
    "& > *": {
      flex: 1,
    },
  },
}));

function Legend({ title, gradient, minMax }) {
  const classes = useStyles();
  const [minGradient, maxGradient] = gradient;
  let min;
  let max;

  if (title === "Purchases" && minMax[0] !== null) {
    [min, max] = minMax.map((purchase) => `$${purchase.toFixed(2)}`);
  } else if (minMax[0] !== null) {
    [min, max] = minMax;
  }

  return (
    <div className={classes.legendContainer}>
      <Typography as="legend" variant="overline">
        {title}
      </Typography>
      <div className={classes.legendCaptions}>
        <Typography variant="caption">{min}</Typography>
        <Typography align="right" variant="caption">
          {max}
        </Typography>
      </div>
      <div
        style={{
          height: "16px",
          backgroundImage: `linear-gradient(to right, ${minGradient}, ${maxGradient})`,
        }}
      />
      <div className={classes.legendCaptions}>
        <Typography variant="caption">Min</Typography>
        <Typography align="right" variant="caption">
          Max
        </Typography>
      </div>
    </div>
  );
}

export default Legend;
