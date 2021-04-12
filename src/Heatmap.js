import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { getAggregatedPurchaseAmount } from "./utils";

export default function Heatmap({
  locations,
  purchasesHash,
  distributionMinMax,
  purchaseMinMax,
  selectedHeatmapOption,
}) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    locations.forEach((location) => {
      if (purchasesHash[location.name]) {
        const aggregatedAmount = getAggregatedPurchaseAmount(
          location.name,
          purchasesHash
        );

        points.push([
          ...location.geocode,
          getAggregatedPurchaseAmount(location.name, purchasesHash),
        ]);
      }
    });

    const heat = L.heatLayer(points, { radius: 100, maxZoom: 13 }).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [locations, map]);

  return null;
}
