/**
 * Utilities for integrating Checkov results with graph visualization
 */

export interface CheckovResourceError {
  has_issues: boolean;
  failed_count: number;
}

export interface CheckovResourceErrors {
  [resourceId: string]: CheckovResourceError;
}

/**
 * Load Checkov resource errors for a specific graph
 */
export const loadCheckovResourceErrors = async (
  graphName: string
): Promise<CheckovResourceErrors> => {
  try {
    const response = await fetch(
      `/checkov/${graphName}/checkov_resource_errors.json`
    );
    if (!response.ok) {
      console.warn(`Failed to load Checkov resource errors for ${graphName}`);
      return {};
    }
    return await response.json();
  } catch (error) {
    console.warn(
      `Error loading Checkov resource errors for ${graphName}:`,
      error
    );
    return {};
  }
};

/**
 * Check if a resource has Checkov issues
 */
export const hasCheckovIssues = (
  resourceErrors: CheckovResourceErrors,
  resourceId: string
): boolean => {
  return resourceErrors[resourceId]?.has_issues || false;
};

/**
 * Get the number of failed checks for a resource
 */
export const getFailedCheckCount = (
  resourceErrors: CheckovResourceErrors,
  resourceId: string
): number => {
  return resourceErrors[resourceId]?.failed_count || 0;
};

/**
 * Generate error indicator text for a resource
 */
export const getErrorIndicatorText = (
  resourceErrors: CheckovResourceErrors,
  resourceId: string
): string => {
  const failedCount = getFailedCheckCount(resourceErrors, resourceId);
  if (failedCount === 0) return "";
  if (failedCount === 1) return "1 issue";
  return `${failedCount} issues`;
};

/**
 * Get error indicator color based on failed check count
 */
export const getErrorIndicatorColor = (failedCount: number): string => {
  if (failedCount === 0) return "transparent";
  if (failedCount <= 3) return "#F56565"; // red.400
  if (failedCount <= 10) return "#ED8936"; // orange.400
  return "#E53E3E"; // red.600
};
