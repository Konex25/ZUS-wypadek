// Headers to mimic browser request (avoids 403 from biznes.gov.pl)
const FETCH_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  Origin: "https://www.biznes.gov.pl",
  Referer: "https://www.biznes.gov.pl/pl/wyszukiwarka-firm",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Ch-Ua":
    '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  Connection: "keep-alive",
};

export const getCompanyDetailsDetails = async (
  companyId: string,
  fetchHeaders: boolean = false
) => {
  const url = new URL(
    "https://www.biznes.gov.pl/pl/wyszukiwarka-firm/api/data-warehouse/GetCompanyDetails"
  );
  url.searchParams.set("id", companyId);
  let response: Response;
  if (fetchHeaders) {
    response = await fetch(url.toString(), { headers: FETCH_HEADERS });
  } else {
    response = await fetch(url.toString());
  }

  if (!response.ok) {
    console.error(`GetCompanyDetails failed with status: ${response.status}`);
    return null;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    console.error("GetCompanyDetails returned non-JSON response");
    return null;
  }

  const parsedResponse = await response.json();
  console.log("=== CEIDG Company Details Response ===");
  console.log("Keys:", Object.keys(parsedResponse));
  console.log(
    "Full response (first 3000 chars):",
    JSON.stringify(parsedResponse, null, 2).substring(0, 3000)
  );
  return parsedResponse;
};

export const getCompanyDetailsByNip = async (nip: string) => {
  const companiesUrl = new URL(
    "https://www.biznes.gov.pl/pl/wyszukiwarka-firm/api/data-warehouse/SearchAdvance"
  );
  console.log({ nip });
  companiesUrl.searchParams.set("nip", nip);

  const response = await fetch(companiesUrl.toString(), {
    headers: FETCH_HEADERS,
  });

  if (!response.ok) {
    console.error(`SearchAdvance failed with status: ${response.status}`);
    return null;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    console.error("SearchAdvance returned non-JSON response");
    return null;
  }

  const parsedResponse = await response.json();
  const companies = parsedResponse.companyList;

  console.log("=== CEIDG Search Response ===");
  console.log("Company list count:", companies?.length || 0);
  if (companies && companies.length > 0) {
    console.log(
      "First company from search:",
      JSON.stringify(companies[0], null, 2).substring(0, 1500)
    );
  }

  if (!companies || companies.length === 0) {
    return null;
  }

  const company = companies[0];
  const companyDetails = await getCompanyDetailsDetails(company.id, true);

  // Merge search data with details data (search might have PKD that details doesn't)
  const mergedData = {
    ...company,
    ...companyDetails,
    // Ensure we keep search data if details doesn't have it
    pkd: companyDetails?.pkd || company?.pkd,
    pkdCode: companyDetails?.pkdCode || company?.pkdCode,
    pkdList:
      companyDetails?.pkdList ||
      company?.pkdList ||
      companyDetails?.PKDList ||
      company?.PKDList,
    przewazajacePKD:
      companyDetails?.przewazajacePKD || company?.przewazajacePKD,
  };

  console.log("=== Merged Company Data ===");
  console.log("PKD fields:", {
    pkd: mergedData.pkd,
    pkdCode: mergedData.pkdCode,
    pkdList: mergedData.pkdList?.slice(0, 3),
    przewazajacePKD: mergedData.przewazajacePKD,
  });

  return mergedData;
};
