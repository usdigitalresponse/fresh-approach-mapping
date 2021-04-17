import L from "leaflet";

export const GOOGLE_CLIENT_ACCESS_TOKEN = "google_client_access_token";

const LOCATION_COLORS = {
  Farm: "#FF570A",
  Hub: "#4897D8",
  "Aggregating Farm": "#FAA055",
  "Food Distribution Org": "#FFDB5c",
  Distributor: "#FF0000",
};

export const MONTHS = ["May", "June", "July", "August", "September"];

/**
 * Creates SVG Map Icons for leaflet consumption
 *
 * @param   {Array}  locationTypes  Contains a list of location types
 * for a specific location
 *
 * @return  {Object}   Leaflet divIcon for location.
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

/**
 * Turns string of dollar amount into float for addition.
 *
 * @param   {String}  price  Price from amount.
 *
 * @return  {Float}   Amount for future aggregation.
 */
export function parsePrice(price) {
  return parseFloat((price || "$0.00").split("$")[1].replace(",", ""));
}

/**
 * Sums together records for one month for distributors.
 *
 * @param   {Array}  monthDistributionList List of distribution records attributed
 * to a specific month.
 * @param   {String}  key Takes either 'totalPounds' or 'boxes'.
 *
 * @return  {Integer} Sums records attributed to a speicific month.
 */
function sumDistributionMonth(monthDistributionList, key) {
  return !monthDistributionList.length
    ? 0
    : monthDistributionList
        .map((record) => parseInt(record[key], 10))
        .reduce((total, item) => total + item, 0);
}

/**
 * Gets total amounts for a distributor.
 *
 * @param   {Object}  distribution    Specific distributor location.
 * @param   {Object}  selectedMonths  Months selected to display in filter control.
 * @param   {String}  key             The type of data to aggregate, i.e. totalPounds, boxes.
 *
 * @return  {Integer}                 Total amount for a specific distribution location.
 */
export function getDistributionAmount(distribution, selectedMonths, key) {
  return MONTHS.reduce((total, month) => {
    if (selectedMonths.includes(month)) {
      return (
        total + sumDistributionMonth(distribution[month.toLowerCase()], key)
      );
    }

    return total;
  }, 0);
}

/**
 * Gets aggregated purchase amount for a specific farm.
 *
 * @param   {Object}       purchase        All purchases for one hub to farm, including all possible months.
 * @param   {[type]}       selectedMonths  Selected months to display from filter.
 * @param   {Array[]}  selectedHubs    List of hubs that are selected to display for.
 *
 * @return  {Integer}                           Total purchases for one hub to one farm.
 */
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

/**
 * Gets line widths for for map polyline.
 *
 * @param   {Integer}  amount An amount for a distribution or purchase.
 * @param   {Array}  minMax  Minimum and Maximum aggregations for a all possible amounts.
 *
 * @return  {Integer}          The width of the line for a respective purchase or distribution.
 */
export function getLineWidth(amount, minMax) {
  const [, max] = minMax;
  const base = 1.5;

  const fraction = amount / max;

  return fraction * 3.5 + base;
}

/**
 * Poundage and Boxes for a specific locagion
 *
 * @return  {Object}  Boxes and Poundage for specific location.
 */
export function getTotalLocationPoundage(
  name,
  hash,
  selectedMonths,
  selectedHubs
) {
  const site = hash[name] || [];

  return site.reduce(
    ({ locationPoundage, locationBoxes }, entry) => {
      if (!selectedHubs.length || selectedHubs.includes(entry.hub)) {
        return {
          locationPoundage:
            locationPoundage +
            getDistributionAmount(entry, selectedMonths, "totalPounds"),
          locationBoxes:
            locationBoxes +
            getDistributionAmount(entry, selectedMonths, "boxes"),
        };
      }

      return { locationPoundage, locationBoxes };
    },
    { locationPoundage: 0, locationBoxes: 0 }
  );
}
