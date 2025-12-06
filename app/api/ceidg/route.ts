import { getCompanyDetailsByNip } from "@/backend";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const nip = searchParams.get("nip");
  const regon = searchParams.get("regon");

  if (!nip && !regon) {
    return Response.json({ error: "NIP or REGON required" }, { status: 400 });
  }

  // Use the backend function which has proper headers
  const companyDetails = nip ? await getCompanyDetailsByNip(nip) : null; // TODO: add getCompanyDetailsByRegon if needed

  if (!companyDetails) {
    return Response.json({ error: "Company not found" }, { status: 404 });
  }

  // Zwróć pełną strukturę danych dla debugowania
  const response = {
    ...companyDetails.basicData,
    correspondenceAddress: companyDetails.addressData?.correspondenceAddress,
    // Dodatkowo zwróć inne możliwe adresy
    address: companyDetails.addressData?.address,
    businessAddress: companyDetails.addressData?.businessAddress,
    registeredAddress: companyDetails.addressData?.registeredAddress,
    pkdCodes: companyDetails.additionalData?.otherPkd,
    // Pełna struktura addressData dla debugowania
    _debug_addressData: companyDetails.addressData,
  };

  return Response.json(response);
};
