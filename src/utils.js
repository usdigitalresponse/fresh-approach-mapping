import L from "leaflet";

export const GOOGLE_CLIENT_ACCESS_TOKEN = "google_client_access_token";

const LOCATION_COLORS = {
  Farm: "#FF570A",
  Hub: "#4897D8",
  "Aggregating Farm": "#FAA055",
  "Food Distribution Org": "#FFDB5c",
  Distributor: "#2F2E33",
};

export const MONTHS = ["May", "June", "July", "August", "September"];

/*
Gets map icons using location types.
*/
export function getMapIcon(locationTypes) {
  return L.divIcon({
    iconSize: (20, 20),
    html: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${locationTypes
      .map((type, i) => {
        const size = (locationTypes.length - i) * 20;
        return `<circle cx="50" cy="50" r="${size}" fill=${LOCATION_COLORS[type]} />`;
      })
      .join()}
    </svg>`,
  });
}

export function parsePrice(price) {
  return parseFloat((price || "$0.00").split("$")[1].replace(",", ""));
}

function sumDistributionMonth(month) {
  return !month.length
    ? 0
    : month
        .map((record) => parseInt(record.totalPounds, 10))
        .reduce((total, item) => total + item, 0);
}

export function getDistributionAmount(distribution, selectedMonths) {
  return MONTHS.reduce((total, month) => {
    if (selectedMonths.includes(month)) {
      return total + sumDistributionMonth(distribution[month.toLowerCase()]);
    }

    return total;
  }, 0);
}

export function getPurchaseAmount(purchase, selectedMonths, selectedHubs = []) {
  if (selectedHubs.length && !selectedHubs.includes(purchase.hubOrganization)) {
    return 0;
  }

  return MONTHS.reduce((total, month) => {
    if (selectedMonths.includes(month)) {
      return total + parsePrice(purchase[month.toLowerCase()]);
    }

    return total;
  }, 0);
}

export function getAggregatedPurchaseAmount(
  item,
  purchasesHash,
  selectedMonths,
  selectedHubs
) {
  const itemPurchaseList = purchasesHash[item.name] || [];

  const totalPurchases = itemPurchaseList.reduce(
    (total, purchase) =>
      total + getPurchaseAmount(purchase, selectedMonths, selectedHubs),
    0
  );

  return totalPurchases.toFixed(2);
}

export function getLineWidth(amount, minMax) {
  const [, max] = minMax;
  const base = 1.5;

  const fraction = amount / max;

  return fraction * 3.5 + base;
}

export function getTotalLocationPoundage(
  name,
  hash,
  selectedMonths,
  selectedHubs
) {
  const site = hash[name] || [];

  return site.reduce((total, entry) => {
    if (!selectedHubs.length || selectedHubs.includes(entry.hub)) {
      return total + getDistributionAmount(entry, selectedMonths);
    }

    return total;
  }, 0);
}
