require("dotenv").config();

const fetch = require("node-fetch");
const camelCase = require("lodash.camelcase");
const get = require("lodash.get");

const distributionsLogic = require("./distributions-logic");

const SHEETS_URI = "https://sheets.googleapis.com/v4/spreadsheets/";
const { SPREADSHEET_ID } = process.env;

function getLocationHash([columns, ...values]) {
  const locationHashByName = {};
  const keys = columns.map((column) => camelCase(column));
  let index = 0;

  // A while loop is used because we should only iterate through populated rows.
  while (values[index] && values[index][1]) {
    const row = values[index];
    const [category, locationName] = row;

    if (locationHashByName[locationName]) {
      locationHashByName[locationName].category.push(category);
    } else {
      const newLocation = { id: index };
      keys.forEach((columnHeader, i) => {
        if (columnHeader === "geocode" && row[i]) {
          newLocation[columnHeader] = row[i].split(", ");
        } else if (columnHeader === "category") {
          newLocation[columnHeader] = [row[i]];
        } else if (
          [
            "bipocOwned",
            "womanOwned",
            "certifiedOrganic",
            "schoolSite",
            "foodBankPartner",
          ].includes(columnHeader)
        ) {
          newLocation[columnHeader] = row[i] === "TRUE";
        } else {
          newLocation[columnHeader] = row[i] === "" ? null : row[i];
        }
      });
      // Only add to hash if geocode is set.
      if (newLocation.geocode) {
        locationHashByName[locationName] = newLocation;
      }
    }
    index += 1;
  }

  return locationHashByName;
}

function mapSheetsResponse([columns, ...values]) {
  const resultList = [];
  let index = 0;
  const keys = columns.map((column) => camelCase(column));
  while (values[index] && values[index][1]) {
    const row = values[index];
    const obj = {};
    keys.forEach((columnHeader, i) => {
      obj[columnHeader] = row[i] === "" ? null : row[i];
    });

    resultList.push(obj);
    index += 1;
  }

  return resultList;
}

function matchDistributionNames(distributions, locationHash) {
  return distributions
    .filter(
      ({ hub, distributionSite }) =>
        get(locationHash[hub], "geocode") &&
        get(locationHash[distributionSite], "geocode")
    )
    .map(({ hub, distributionSite, ...rest }) => ({
      hubId: get(locationHash[hub], "id"),
      hubGeo: get(locationHash[hub], "geocode"),
      distributionSiteId: get(locationHash[distributionSite], "id"),
      distributionSiteGeo: get(locationHash[distributionSite], "geocode"),
      bipocOwned: get(locationHash[distributionSite], "bipocOwned"),
      schoolSite: get(locationHash[distributionSite], "schoolSite"),
      foodBankPartner: get(locationHash[distributionSite], "foodBankPartner"),
      womanOwned: get(locationHash[distributionSite], "womanOwned"),
      certifiedOrganic: get(locationHash[distributionSite], "certifiedOrganic"),
      hub,
      distributionSite,
      ...rest,
    }));
}

function matchPurchasesNames(purchases, locationHash) {
  return purchases
    .filter(
      ({ farmName, hubOrganization }) =>
        get(locationHash[farmName], "geocode") &&
        get(locationHash[hubOrganization], "geocode")
    )
    .map(({ hubOrganization, farmName, ...rest }) => ({
      hubOrganizationId: get(locationHash[hubOrganization], "id"),
      hubOrganizationGeo: get(locationHash[hubOrganization], "geocode"),
      farmNameId: get(locationHash[farmName], "id"),
      farmNameGeo: get(locationHash[farmName], "geocode"),
      bipocOwned: get(locationHash[farmName], "bipocOwned"),
      schoolSite: get(locationHash[farmName], "schoolSite"),
      foodBankPartner: get(locationHash[farmName], "foodBankPartner"),
      womanOwned: get(locationHash[farmName], "womanOwned"),
      certifiedOrganic: get(locationHash[farmName], "certifiedOrganic"),
      hubOrganization,
      farmName,
      ...rest,
    }));
}

exports.handler = async function handler(event) {
  const [addresses, distributions, purchases] = await Promise.all(
    ["Addresses", "Distributions", "Purchases"].map(async (sheetName) => {
      const data = await fetch(
        `${SHEETS_URI}${SPREADSHEET_ID}/values/${sheetName}!A:N?access_token=${event.headers.authorization}`
      );
      return data.json();
    })
  );

  if (addresses.error) {
    return {
      statusCode: addresses.error.code,
      body: JSON.stringify({ error: addresses.error.message }),
    };
  }

  const parsedLocationHash = getLocationHash(addresses.values);

  const newDistributions = distributionsLogic.parseDistributions(
    matchDistributionNames(
      mapSheetsResponse(distributions.values),
      parsedLocationHash
    )
  );

  const newPurchases = matchPurchasesNames(
    mapSheetsResponse(purchases.values),
    parsedLocationHash
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      locations: Object.values(parsedLocationHash),
      distributions: newDistributions,
      purchases: newPurchases,
      contracts: Array.from(
        new Set(newPurchases.map(({ contract }) => contract))
      ),
    }),
  };
};
