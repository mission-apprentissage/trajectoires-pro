import { myPosition } from "../components/form/AddressField";

const API_BASE_URL = "https://api-adresse.data.gouv.fr";

export async function fetchAddress(
  address: string,
  { signal }: { signal: AbortSignal | undefined } = { signal: undefined }
): Promise<any> {
  if (!address || address.length < 3) {
    return null;
  }

  if (address === myPosition) {
    // get the current users location
    return await new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            resolve({
              features: [
                {
                  geometry: {
                    coordinates: [longitude, latitude],
                  },
                },
              ],
            });
          },
          (error) => {
            console.error("Error getting user location:", error);
            resolve(null);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        resolve(null);
      }
    });
  }

  //TODO: gestion des erreurs
  const type = address.split(" ").length > 1 ? "" : "municipality";
  const result = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(address)}&type=${type}&limit=20`, {
    signal,
  });
  const json = await result.json();
  return json;
}

export async function fetchReverse(
  latitude: number,
  longitude: number,
  { signal }: { signal: AbortSignal | undefined } = { signal: undefined }
): Promise<any> {
  //TODO: gestion des erreurs
  const result = await fetch(`${API_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}`, { signal });
  const json = await result.json();
  return json;
}
