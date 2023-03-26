import axios from "axios";

export interface GeocodeResult {
  osmId: number;
  lat: number;
  lon: number;
  street: string;
  geojson: string;
}

export async function geocode(
  street: string,
  houseNumber: string
): Promise<GeocodeResult> {
  const formattedStreet = `${street} ${houseNumber}`.replace(" ", "+");
  const url = `https://nominatim.openstreetmap.org/search?email=ivan.kovalenko1@nure.ua&format=json&addressdetails=1&polygon_geojson=1&street=${formattedStreet}&city=Харків&country=Україна`;

  const response = await axios.get(url);
  const result = response.data;

  if (result.length === 0) {
    throw new Error(`Geocoding failed! Can't find ${street} ${houseNumber}`);
  }

  const firstResult = result[0];
  const osmType = firstResult.osm_type;
  const osmId = firstResult.osm_id;

  if (osmType !== "way") {
    throw new Error(
      `Geocoding failed! OSM type '${osmType}' != way for id ${osmId}!`
    );
  }

  const lat = parseFloat(firstResult.lat);
  const lon = parseFloat(firstResult.lon);
  const road = firstResult.address.road as string;
  const geojson = firstResult.geojson as string;

  return {
    osmId: osmId,
    lat: lat,
    lon: lon,
    street: road,
    geojson: geojson
  };
}
