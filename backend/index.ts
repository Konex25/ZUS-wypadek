export const getCompanyDetailsDetails = async (companyId: string) => {
  const url = new URL(
    "https://www.biznes.gov.pl/pl/wyszukiwarka-firm/api/data-warehouse/GetCompanyDetails"
  );
  url.searchParams.set("id", companyId);
  const response = await fetch(url.toString());
  const parsedResponse = await response.json();
  console.log(parsedResponse);
  return parsedResponse;
};

export const getCompanyDetailsByNip = async (nip: string) => {
  const companiesUrl = new URL(
    "https://www.biznes.gov.pl/pl/wyszukiwarka-firm/api/data-warehouse/SearchAdvance"
  );
  companiesUrl.searchParams.set("nip", nip);

  const response = await fetch(companiesUrl.toString());
  const parsedResponse = await response.json();
  const companies = parsedResponse.companyList;
  const company = companies[0];

  return company;
};
