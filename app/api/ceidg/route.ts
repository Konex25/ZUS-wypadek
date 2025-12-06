const getCompanyDetailsDetails = async (companyId: string) => {
  const url = new URL(
    "https://www.biznes.gov.pl/pl/wyszukiwarka-firm/api/data-warehouse/GetCompanyDetails"
  );
  url.searchParams.set("id", companyId);
  const response = await fetch(url.toString());
  const parsedResponse = await response.json();
  console.log(parsedResponse);
  return parsedResponse;
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const companiesUrl = new URL(
    "https://www.biznes.gov.pl/pl/wyszukiwarka-firm/api/data-warehouse/SearchAdvance"
  );
  if (searchParams.get("nip")) {
    companiesUrl.searchParams.set("nip", searchParams.get("nip")!);
  }
  if (searchParams.get("regon")) {
    companiesUrl.searchParams.set("regon", searchParams.get("regon")!);
  }

  const companiesResponse = await fetch(companiesUrl.toString());

  const parsedResponse = await companiesResponse.json();
  const companies = parsedResponse.companyList;
  const company = companies[0];

  console.log(company);

  if (!company) {
    return Response.json({ error: "Company not found" }, { status: 404 });
  }

  const companyId = company.id;
  const companyDetails = await getCompanyDetailsDetails(companyId);

  return Response.json({
    ...companyDetails.basicData,
    correspondenceAddress: companyDetails.addressData.correspondenceAddress,
    pkdCodes: companyDetails.additionalData.otherPkd,
  });
};
