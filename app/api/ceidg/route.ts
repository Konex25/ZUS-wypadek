export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const url = new URL(
    "https://www.biznes.gov.pl/pl/wyszukiwarka-firm/api/data-warehouse/SearchAdvance"
  );

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

  return Response.json(company);
};
