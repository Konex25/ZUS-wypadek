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
  console.log("Company details:", parsedResponse);
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

  if (!companies || companies.length === 0) {
    return null;
  }

  const company = companies[0];
  const companyDetails = await getCompanyDetailsDetails(company.id, true);

  return companyDetails;
};
