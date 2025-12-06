export interface CEIDGCompany {
  id: string;
  source: string;
  name: string;
  nip: string;
  regon: string;
  registerDate: string;
  status: "AKTYWNY" | string;
}
