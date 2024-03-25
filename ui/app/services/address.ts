const API_BASE_URL = "https://api-adresse.data.gouv.fr";

export async function fetchAddress(address: string): Promise<any> {
  if (!address || address.length < 3) {
    return null;
  }

  //TODO: gestion des erreurs
  const type = address.split(" ").length > 1 ? "" : "municipality";
  const result = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(address)}&type=${type}`);
  const json = await result.json();

  return json;
}

export async function fetchReverse(latitude: number, longitude: number): Promise<any> {
  //TODO: gestion des erreurs
  const result = await fetch(`${API_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}`);
  const json = await result.json();
  return json;
}
