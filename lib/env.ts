/**
 * Determines whether the mock API should be used.
 * This is true if in a browser environment or if USE_MOCK_API environment variable is set to 'true'.
 */
export function shouldUseMockApi(): boolean {
  return process.env.USE_MOCK_API === 'true';
}
