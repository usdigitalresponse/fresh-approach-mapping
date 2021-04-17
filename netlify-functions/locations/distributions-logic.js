const MONTH_NUMBERS = {
  5: "may",
  6: "june",
  7: "july",
  8: "august",
  9: "september",
};

function parseDistributions(distributionRecords) {
  const distributionHash = {};

  distributionRecords.forEach((dist) => {
    if (!distributionHash[dist.hub]) {
      distributionHash[dist.hub] = {};
    }

    if (
      !distributionHash[dist.hub][dist.distributionSite] &&
      MONTH_NUMBERS[dist.deliverDate[0]]
    ) {
      distributionHash[dist.hub][dist.distributionSite] = {
        may: [],
        june: [],
        july: [],
        august: [],
        september: [],
      };
    }

    if (MONTH_NUMBERS[dist.deliverDate[0]]) {
      const locationRelationship =
        distributionHash[dist.hub][dist.distributionSite];
      locationRelationship[MONTH_NUMBERS[dist.deliverDate[0]]].push(dist);

      locationRelationship.meta = {
        hub: dist.hub,
        hubId: dist.hubId,
        hubGeo: dist.hubGeo,
        womanOwned: dist.womanOwned,
        bipocOwned: dist.bipocOwned,
        schoolSite: dist.schoolSite,
        foodBankPartner: dist.foodBankPartner,
        certifiedOrganic: dist.certifiedOrganic,
        distributionSite: dist.distributionSite,
        distributionSiteId: dist.distributionSiteId,
        distributionSiteGeo: dist.distributionSiteGeo,
      };
    }
  });

  const parsedRecords = [];
  Object.values(distributionHash).forEach((distributionSites) => {
    Object.values(distributionSites).forEach(({ meta, ...months }) => {
      parsedRecords.push({
        ...meta,
        ...months,
      });
    });
  });

  return parsedRecords;
}

exports.parseDistributions = parseDistributions;
