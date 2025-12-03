// Optional wrapper for expo-location dynamic import
// This avoids imposing a hard dependency on expo-location in projects that don't use it.

export default async function getLocationModule() {
  try {
    // @ts-ignore - optional package
    // eslint-disable-next-line import/no-unresolved
    const LocationModule = await import("expo-location");
    return LocationModule?.default || LocationModule;
  } catch {
    return null;
  }
}
