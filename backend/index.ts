export const getCompanyDetailsDetails = async (companyId: string) => {
  const url = new URL(
    "https://www.biznes.gov.pl/pl/wyszukiwarka-firm/api/data-warehouse/GetCompanyDetails"
  );
  url.searchParams.set("id", companyId);
  const response = await fetch(url.toString());

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
  companiesUrl.searchParams.set("nip", nip);

  const response = await fetch(companiesUrl.toString());

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
  const companyDetails = await getCompanyDetailsDetails(company.id);

  return companyDetails;
};
