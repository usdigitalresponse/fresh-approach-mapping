import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ListItemText from "@material-ui/core/ListItemText";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import { makeStyles } from "@material-ui/core/styles";
import { scaleLinear } from "d3-scale";

import Legend from "./Legend";
import { parsePrice, MONTHS, getDistributionAmount } from "./utils";

const PURCHASE_GRADIENT = ["#a7c0d4", "#0076d6"];
const DISTRIBUTION_GRADIENT = ["#f7caa6", "#fc7405"];

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: "#90a4ae",
    height: "100%",
    padding: theme.spacing(2),
  },
  legendCaptions: {
    display: "flex",
    "& > *": {
      flex: 1,
    },
  },
  mapPaper: {
    backgroundColor: "#b0bec5",
  },
  formControl: {
    width: "100%",
    paddingBottom: theme.spacing(2),
  },
  map: {
    "& .leaflet-marker-icon": {
      border: 0,
      backgroundColor: "transparent",
    },
    border: 0,
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function filteredHubsTest(selectedHubs, record, recordKey) {
  return !selectedHubs.length || selectedHubs.includes(record[recordKey]);
}

function filteredFarmsTest(record, filters) {
  return Object.keys(filters).every(
    (filterName) => !filters[filterName] || record[filterName]
  );
}

function filterLocations(selectedHubs, filters, records) {
  return () =>
    records.filter((record) => {
      if (record.category && record.category.includes("Hub")) {
        return filteredHubsTest(selectedHubs, record, "name");
      }

      if (record.category && record.category.includes("Farm")) {
        return filteredFarmsTest(record, filters);
      }

      return true;
    });
}

export default function Filter({
  locations,
  distributions,
  purchases,
  children,
}) {
  const classes = useStyles();

  const [selectedHubs, setSelectedHubs] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState(MONTHS);
  const [isHeatmap, toggleHeatmap] = useState(false);
  const [showPurchases, setShowPurchases] = useState(true);
  const [showDistributions, setShowDistributions] = useState(true);
  const [selectedHeatmapOption, setSelectedHeatmapOption] = useState(
    "providers"
  );

  //create distributions and purchases hash where first key is

  const [demographicsFilters, setDemographicsFilters] = useState({
    bipocOwned: false,
    womanOwned: false,
    certifiedOrganic: false,
  });

  const filteredLocations = useMemo(
    filterLocations(selectedHubs, demographicsFilters, locations),
    [locations, demographicsFilters, selectedHubs]
  );

  const hubs = useMemo(
    () =>
      locations
        ? locations.filter(({ category }) => category.includes("Hub"))
        : [],
    [locations]
  );

  function handleDemographicsFilters({ target: { name } }) {
    setDemographicsFilters({
      ...demographicsFilters,
      [name]: !demographicsFilters[name],
    });
  }

  const filteredPurchases = useMemo(
    () =>
      purchases.filter(
        (purchase) =>
          filteredHubsTest(selectedHubs, purchase, "hubOrganization") &&
          filteredFarmsTest(purchase, demographicsFilters)
      ),
    [selectedHubs, demographicsFilters, purchases]
  );

  const purchaseMinMax = useMemo(() => {
    let min = null;
    let max = null;

    for (let i = 0; i < filteredPurchases.length; i += 1) {
      let month = 0;

      MONTHS.forEach((monthValue) => {
        const monthPrice = parsePrice(
          filteredPurchases[i][monthValue.toLowerCase()]
        );

        if (selectedMonths.includes(monthValue)) {
          month += monthPrice;
        }
      });

      if (min === null || month < min) {
        min = month;
      }

      if (min === null || month > max) {
        max = month;
      }
    }

    return [min || 0, max || 0];
  }, [filteredPurchases, selectedMonths]);

  const purchaseGradient = useMemo(
    // #4897D8 is the base color.
    () => scaleLinear().domain(purchaseMinMax).range(PURCHASE_GRADIENT),
    [purchaseMinMax]
  );

  const filteredDistributions = useMemo(
    () =>
      distributions.filter((distribution) =>
        filteredHubsTest(selectedHubs, distribution, "hub")
      ),
    [selectedHubs, distributions]
  );

  const distributionMinMax = useMemo(() => {
    let min = null;
    let max = null;

    for (let i = 0; i < filteredDistributions.length; i += 1) {
      const distribution = filteredDistributions[i];
      const distributionAmount = getDistributionAmount(
        distribution,
        selectedMonths
      );

      if (min === null || distributionAmount < min) {
        min = distributionAmount;
      }

      if (max === null || distributionAmount > max) {
        max = distributionAmount;
      }
    }

    return [min || 0, max || 0];
  }, [filteredDistributions, selectedMonths]);

  const distributionGradient = useMemo(
    () => scaleLinear().domain(distributionMinMax).range(DISTRIBUTION_GRADIENT),
    [distributionMinMax]
  );

  return (
    <Grid container alignItems="stretch">
      <Grid item xs={3}>
        <Paper square className={classes.paper}>
          <Typography as="legend" variant="subtitle1">
            Filters
          </Typography>
          <FormControl component="fieldset" className={classes.formControl}>
            <InputLabel id="demo-mutiple-chip-label">Filter Hubs</InputLabel>
            <Select
              labelId="demo-mutiple-chip-label"
              id="demo-mutiple-chip"
              multiple
              value={selectedHubs}
              onChange={(event) => {
                setSelectedHubs(event.target.value);
              }}
              input={<Input id="select-multiple-chip" />}
              renderValue={(selected) => (
                <div className={classes.chips}>
                  {selected.map((name) => (
                    <Chip key={name} label={name} className={classes.chip} />
                  ))}
                </div>
              )}
              MenuProps={MenuProps}
            >
              {hubs.map(({ id, name }) => (
                <MenuItem key={id} value={name}>
                  <Checkbox checked={selectedHubs.includes(name)} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">
              Purchases and Distributions
            </FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  name="purchases"
                  onChange={() => setShowPurchases(!showPurchases)}
                  checked={showPurchases}
                />
              }
              label="Purchases"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="distributions"
                  onChange={() => setShowDistributions(!showDistributions)}
                  checked={showDistributions}
                />
              }
              label="Distributions"
            />
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Filter Providers</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  name="bipocOwned"
                  checked={demographicsFilters.bipocOwned}
                  onChange={handleDemographicsFilters}
                />
              }
              label="Filter to BIPOC Owned"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="womanOwned"
                  checked={demographicsFilters.womanOwned}
                  onChange={handleDemographicsFilters}
                />
              }
              label="Filter to Women Owned"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="certifiedOrganic"
                  checked={demographicsFilters.certifiedOrganic}
                  onChange={handleDemographicsFilters}
                />
              }
              label="Filter to Certified Organic"
            />
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <InputLabel id="month-select">Months</InputLabel>
            <Select
              labelId="month-select"
              id="month-chip"
              multiple
              value={selectedMonths}
              onChange={(event) => {
                setSelectedMonths(event.target.value);
              }}
              input={<Input id="select-month-chip" />}
              renderValue={(selected) => (
                <small className={classes.chips}>
                  {selected.map((name) => name).join(", ")}
                </small>
              )}
              MenuProps={MenuProps}
            >
              {MONTHS.map((month) => (
                <MenuItem key={month} value={month}>
                  <Checkbox checked={selectedMonths.includes(month)} />
                  <ListItemText primary={month} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* <FormControl component="fieldset">
            <FormLabel component="legend">Map Display</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={isHeatmap}
                    onChange={() => toggleHeatmap(!isHeatmap)}
                    name="heatmap"
                  />
                }
                label="Use Heatmap"
              />
              <FormLabel component="legend">Heatmap Values</FormLabel>
              <RadioGroup
                aria-label="heatmapvalues"
                name="heatmap-values"
                value={selectedHeatmapOption}
                onChange={({ target }) =>
                  setSelectedHeatmapOption(target.value)
                }
              >
                <FormControlLabel
                  value="providers"
                  control={<Radio />}
                  label="Funds to Providers"
                />
                <FormControlLabel
                  value="distributors"
                  control={<Radio />}
                  label="Food to Distributors"
                />
              </RadioGroup>
            </FormGroup>
          </FormControl> */}
          <div>
            <Typography as="legend" variant="subtitle1">
              Legend
            </Typography>
            <Legend
              title="Purchases"
              gradient={PURCHASE_GRADIENT}
              minMax={purchaseMinMax}
            />
            <Legend
              title="Distributions"
              gradient={DISTRIBUTION_GRADIENT}
              minMax={distributionMinMax}
            />
          </div>
        </Paper>
      </Grid>

      <Grid className={classes.map} item xs={9}>
        <Paper square className={`${classes.paper} ${classes.mapPaper}`}>
          {children({
            filteredLocations,
            filteredPurchases,
            filteredDistributions,
            isHeatmap,
            selectedHeatmapOption,
            selectedMonths,
            selectedHubs,
            showPurchases,
            showDistributions:
              showDistributions &&
              Object.values(demographicsFilters).every((d) => !d),
            purchaseGradient,
            distributionGradient,
            distributionMinMax,
            purchaseMinMax,
          })}
        </Paper>
      </Grid>
    </Grid>
  );
}

Filter.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.func.isRequired,
};
