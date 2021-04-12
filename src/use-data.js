import { useEffect, useCallback, useState } from "react";

const URL = "/.netlify/functions/locations";

export default function useData({ token, removeToken }) {
  const [locations, setLocations] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const fetchData = useCallback(async () => {
    const {
      locations: newLocations,
      distributions: newDistributions,
      purchases: newPurchases,
      error,
    } = await fetch(URL, {
      headers: { Authorization: token },
    }).then((res) => res.json());

    if (error) {
      return removeToken();
    }

    setLocations(newLocations);
    setDistributions(newDistributions);
    setPurchases(newPurchases);

    return null;
  }, [token, removeToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    distributions,
    locations,
    purchases,
  };
}
