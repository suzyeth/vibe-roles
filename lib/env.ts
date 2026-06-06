export function isOffline(): boolean {
  return process.env.GLM_OFFLINE === "true";
}
