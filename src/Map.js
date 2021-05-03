import React, { useMemo } from "react";
import Proptypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import Nav from "./Nav";
import Filter from "./Filter";
import Heatmap from "./Heatmap";
import {
  getMapIcon,
  getDistributionAmount,
  getPurchaseAmount,
  getAggregatedPurchaseAmount,
  getTotalLocationPoundage,
  getLineWidth,
} from "./utils";
import useData from "./use-data";

const useStyles = makeStyles(() => ({
  root: {
    height: "100%",
    "& .leaflet-tile-pane": {
      filter: "grayscale(100%);",
    },
    "& .legend-flex": {
      display: "flex",
      alignItems: "center",
    },
  },
  paper: {
    backgroundColor: "lightgray",
    height: "100%",
  },
  map: {
    border: 0,

    "& .leaflet-marker-icon": {
      border: 0,
      backgroundColor: "transparent",
    },
  },
}));

const position = [37.77191462466318, -122.4291251170002];

const Map = ({ token, removeToken }) => {
  const classes = useStyles();

  const { locations, distributions, purchases, contracts } = useData({
    token,
    removeToken,
  });

  const purchasesHash = useMemo(() => {
    const hash = {};

    purchases.forEach((purchase) => {
      if (hash[purchase.farmName]) {
        hash[purchase.farmName].push(purchase);
      } else {
        hash[purchase.farmName] = [purchase];
      }
    });
    return hash;
  }, [purchases]);

  const distributionsHash = useMemo(() => {
    const hash = {};

    distributions.forEach((distribution) => {
      if (hash[distribution.distributionSite]) {
        hash[distribution.distributionSite].push(distribution);
      } else {
        hash[distribution.distributionSite] = [distribution];
      }
    });
    return hash;
  }, [distributions]);

  return (
    <div>
      <Nav removeToken={removeToken} />
      <Filter
        locations={locations}
        contracts={contracts}
        distributions={distributions}
        purchases={purchases}
        className={classes.paper}
      >
        {({
          filteredLocations,
          filteredPurchases,
          filteredDistributions,
          isHeatmap,
          selectedHeatmapOption,
          selectedMonths,
          showPurchases,
          showDistributions,
          purchaseGradient,
          distributionGradient,
          distributionMinMax,
          purchaseMinMax,
          selectedHubs,
        }) => (
          <MapContainer center={position} zoom={8} className={classes.root}>
            <TileLayer
              attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isHeatmap ? (
              <Heatmap
                locations={locations}
                purchasesHash={purchasesHash}
                distributionMinMax={distributionMinMax}
                purchaseMinMax={purchaseMinMax}
                selectedHeatmapOption={selectedHeatmapOption}
              />
            ) : (
              <>
                {filteredLocations.map((location) => {
                  const aggregatedPurchaseAmount = getAggregatedPurchaseAmount(
                    location,
                    purchasesHash,
                    selectedMonths,
                    selectedHubs
                  );
                  const isFarm =
                    location.category.includes("Farm") ||
                    location.category.includes("Aggregating Farm");
                  const isDistributionSite = location.category.includes(
                    "Food Distribution Org"
                  );
                  const {
                    locationBoxes,
                    locationPoundage,
                  } = getTotalLocationPoundage(
                    location.name,
                    distributionsHash,
                    selectedMonths,
                    selectedHubs
                  );

                  if (aggregatedPurchaseAmount === "0.00" && isFarm) {
                    return null;
                  }

                  if (locationPoundage === 0 && isDistributionSite) {
                    return null;
                  }

                  return (
                    <Marker
                      key={location.id}
                      className={classes.icon}
                      position={location.geocode}
                      icon={getMapIcon(location.category)}
                      style={{ border: 0 }}
                    >
                      <Popup onOpen={() => console.log(location)}>
                        <div style={{ display: "flex" }}>
                          {location.locationImage && (
                            <div style={{ width: 120, paddingRight: 30 }}>
                              <img
                                style={{ width: "100%" }}
                                src={location.locationImage}
                                alt=""
                              />
                            </div>
                          )}
                          <div>
                            <strong>Name: </strong>
                            {location.name}
                            <br />
                            {location.description && (
                              <>
                                <strong>Description: </strong>
                                <span>{location.description}</span>
                                <br />
                              </>
                            )}
                            <strong>Address: </strong>
                            {location.address}
                            <br />
                            <strong>Category: </strong>
                            {location.category.join(", ")}
                            <br />
                            {isFarm && Object.keys(purchasesHash).length && (
                              <>
                                <strong>Total Purchase Amount: </strong>
                                <span>{`$${aggregatedPurchaseAmount}`}</span>
                              </>
                            )}
                            {isDistributionSite &&
                              Object.keys(distributionsHash).length && (
                                <>
                                  <strong>Total Food Poundage: </strong>
                                  <span>{locationPoundage}</span>
                                  <br />
                                  <strong>Total Boxes: </strong>
                                  <span>{locationBoxes}</span>
                                </>
                              )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                {showDistributions &&
                  filteredDistributions.map((distribution) => (
                    <Polyline
                      key={distribution.id}
                      positions={[
                        distribution.hubGeo,
                        distribution.distributionSiteGeo,
                      ]}
                      pathOptions={{
                        color: distributionGradient(
                          getDistributionAmount(
                            distribution,
                            selectedMonths,
                            "totalPounds"
                          )
                        ),
                        weight: getLineWidth(
                          getDistributionAmount(
                            distribution,
                            selectedMonths,
                            "totalPounds"
                          ),
                          distributionMinMax
                        ),
                      }}
                    />
                  ))}
                {showPurchases &&
                  filteredPurchases.map((purchase) => (
                    <Polyline
                      key={purchases.id}
                      positions={[
                        purchase.hubOrganizationGeo,
                        purchase.farmNameGeo,
                      ]}
                      pathOptions={{
                        color: purchaseGradient(
                          getPurchaseAmount(purchase, selectedMonths)
                        ),
                        weight: getLineWidth(
                          getPurchaseAmount(purchase, selectedMonths),
                          purchaseMinMax
                        ),
                      }}
                    />
                  ))}
              </>
            )}
          </MapContainer>
        )}
      </Filter>
    </div>
  );
};

Map.propTypes = {
  token: Proptypes.string.isRequired,
  removeToken: Proptypes.func.isRequired,
};

export default Map;
