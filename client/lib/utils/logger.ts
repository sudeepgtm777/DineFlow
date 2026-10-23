// @ts-nocheck
// Set development mode directly
const isDevelopment = true; // Hardcoded to development

/**
 * Logs error information with context
 */
export function logError(error, context, metadata) {
  if (isDevelopment) {
    console.groupCollapsed('%c[ERROR] ' + context, 'color: red; font-weight: bold;');
    console.error('Error:', error);
    
    if (error.stack) {
      console.groupCollapsed('Stack trace');
      console.log(error.stack);
      console.groupEnd();
    }
    
    if (metadata) {
      console.group('Additional Context');
      console.log(metadata);
      console.groupEnd();
    }
    
    console.groupEnd();
  }
  
  // Production error tracking would go here
}

/**
 * Logs informational messages
 */
export function logInfo(message, data) {
  if (isDevelopment) {
    console.groupCollapsed('%c[INFO] ' + message, 'color: blue; font-weight: bold;');
    if (data) console.log(data);
    console.groupEnd();
  }
}

/**
 * Logs warning messages
 */
export function logWarning(message, data) {
  if (isDevelopment) {
    console.groupCollapsed('%c[WARN] ' + message, 'color: orange; font-weight: bold;');
    if (data) console.warn(data);
    console.groupEnd();
  }
}

/**
 * Initialize axios request/response logging
 */
export function initAxiosLogging() {
  if (isDevelopment) {
    axios.interceptors.request.use(function(config) {
      logInfo('Request: ' + config.method.toUpperCase() + ' ' + config.url, {
        params: config.params,
        data: config.data
      });
      return config;
    }, function(error) {
      logError(error, 'Axios Request Error');
      return Promise.reject(error);
    });

    axios.interceptors.response.use(
      function(response) {
        logInfo('Response: ' + response.status + ' ' + response.config.url, {
          data: response.data
        });
        return response;
      },
      function(error) {
        logError(error, 'Axios Response Error', {
          config: error.config
        });
        return Promise.reject(error);
      }
    );
  }
}