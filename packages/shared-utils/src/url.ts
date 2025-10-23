/**
 * URL utilities for URL manipulation and parsing
 */

/**
 * Parse query string into an object
 */
export function parseQueryString(queryString: string): Record<string, string | string[]> {
  const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of params.entries()) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        (result[key] as string[]).push(value);
      } else {
        result[key] = [result[key] as string, value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Build query string from an object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(key, String(item)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

/**
 * Add query parameters to a URL
 */
export function addQueryParams(url: string, params: Record<string, any>): string {
  const [baseUrl, existingQuery] = url.split('?');
  const existingParams = existingQuery ? parseQueryString(existingQuery) : {};
  const mergedParams = { ...existingParams, ...params };
  const queryString = buildQueryString(mergedParams);

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Remove query parameters from a URL
 */
export function removeQueryParams(url: string, paramsToRemove: string[]): string {
  const [baseUrl, existingQuery] = url.split('?');
  
  if (!existingQuery) {
    return url;
  }

  const params = parseQueryString(existingQuery);
  paramsToRemove.forEach(param => delete params[param]);
  const queryString = buildQueryString(params);

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get domain from URL
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Get protocol from URL
 */
export function getProtocol(url: string): string {
  try {
    return new URL(url).protocol;
  } catch {
    return '';
  }
}

/**
 * Check if URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if URL is relative
 */
export function isRelativeUrl(url: string): boolean {
  return !isAbsoluteUrl(url);
}

/**
 * Join URL paths
 */
export function joinPaths(...paths: string[]): string {
  return paths
    .map((path, index) => {
      if (index === 0) {
        return path.replace(/\/+$/, '');
      }
      return path.replace(/^\/+/, '').replace(/\/+$/, '');
    })
    .filter(Boolean)
    .join('/');
}

/**
 * Normalize URL by removing double slashes, trailing slashes, etc.
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove trailing slash except for root
    if (urlObj.pathname !== '/') {
      urlObj.pathname = urlObj.pathname.replace(/\/+$/, '');
    }
    // Remove double slashes in pathname
    urlObj.pathname = urlObj.pathname.replace(/\/+/g, '/');
    return urlObj.toString();
  } catch {
    // Fallback for relative URLs
    return url
      .replace(/\/+/g, '/')
      .replace(/\/+$/, '')
      .replace(/^\/*/, '/');
  }
}

/**
 * Extract file extension from URL
 */
export function getFileExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const lastDot = pathname.lastIndexOf('.');
    const lastSlash = pathname.lastIndexOf('/');
    
    if (lastDot > lastSlash && lastDot !== -1) {
      return pathname.slice(lastDot + 1);
    }
    return '';
  } catch {
    const lastDot = url.lastIndexOf('.');
    const lastSlash = url.lastIndexOf('/');
    const lastQuery = url.lastIndexOf('?');
    const lastHash = url.lastIndexOf('#');
    
    if (lastDot > lastSlash && lastDot !== -1) {
      let extension = url.slice(lastDot + 1);
      // Remove query string and hash
      if (lastQuery !== -1 && lastQuery > lastDot) {
        extension = extension.slice(0, lastQuery - lastDot - 1);
      }
      if (lastHash !== -1 && lastHash > lastDot) {
        extension = extension.slice(0, lastHash - lastDot - 1);
      }
      return extension;
    }
    return '';
  }
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert relative URL to absolute URL
 */
export function toAbsoluteUrl(relativeUrl: string, baseUrl: string): string {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return relativeUrl;
  }
}