/**
 * useNetworkStatus.ts - Enhanced Network Connectivity Detection Hook
 * Provides reliable internet connectivity detection with actual network testing
 * instead of relying on the unreliable navigator.onLine API
 */

import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isConnecting: boolean;
  lastChecked: Date | null;
  error: string | null;
}

interface UseNetworkStatusOptions {
  checkInterval?: number; // Interval in milliseconds for periodic checks
  timeout?: number; // Timeout for network requests in milliseconds
  endpoints?: string[]; // Custom endpoints to test connectivity
  enableNetworkTests?: boolean; // Enable/disable actual network tests (fallback to navigator.onLine)
}

const DEFAULT_ENDPOINTS = [
  'https://cdn.jsdelivr.net/npm/axios@1.6.0/package.json',
  'https://api.github.com/zen',
  'https://jsonplaceholder.typicode.com/posts/1',
  'https://httpbin.org/status/200'
];

const DEFAULT_OPTIONS: Required<UseNetworkStatusOptions> = {
  checkInterval: 30000, // Check every 30 seconds
  timeout: 5000, // 5 second timeout
  endpoints: DEFAULT_ENDPOINTS,
  enableNetworkTests: true // Enable network tests by default
};

/**
 * Enhanced network status hook that performs actual connectivity tests
 * @param options Configuration options for network testing
 * @returns NetworkStatus object with connectivity information
 */
export const useNetworkStatus = (options: UseNetworkStatusOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine, // Initial fallback to navigator.onLine
    isConnecting: false,
    lastChecked: null,
    error: null
  });

  /**
   * Test connectivity by attempting to fetch from multiple endpoints
   * Uses a race condition approach - first successful response wins
   */
  const testConnectivity = useCallback(async (): Promise<boolean> => {
    setNetworkStatus(prev => ({ ...prev, isConnecting: true, error: null }));
    
    // If network tests are disabled, fallback to navigator.onLine
    if (!config.enableNetworkTests) {
      const isOnline = navigator.onLine;
      setNetworkStatus(prev => ({
        ...prev,
        isOnline,
        isConnecting: false,
        lastChecked: new Date(),
        error: isOnline ? null : 'Using browser connectivity status (network tests disabled)'
      }));
      return isOnline;
    }
    
    try {
      // Create promises for all endpoints with proper error handling
      const testPromises = config.endpoints.map(async (endpoint) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), config.timeout);
          
          const response = await fetch(endpoint, {
            method: 'GET', // Use GET for better compatibility
            mode: 'cors', // Use CORS mode for proper error handling
            cache: 'no-cache',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json, text/plain, */*'
            }
          });
          
          clearTimeout(timeoutId);
          return response.ok;
        } catch (fetchError) {
          // Log specific errors for debugging but don't let them block authentication
          console.debug(`Network test failed for ${endpoint}:`, fetchError);
          // Return false but don't throw - let other endpoints be tested
          return false;
        }
      });

      // Wait for at least one successful response
      const results = await Promise.all(testPromises);
      const isConnected = results.some(result => result === true);
      
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: isConnected,
        isConnecting: false,
        lastChecked: new Date(),
        error: isConnected ? null : 'Network connectivity uncertain - authentication may still work'
      }));
      
      return isConnected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network test failed';
      console.debug('Network connectivity test error:', error);
      
      // Fallback to navigator.onLine when network tests fail completely
      const fallbackOnline = navigator.onLine;
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: fallbackOnline,
        isConnecting: false,
        lastChecked: new Date(),
        error: `${errorMessage} - Using browser fallback (${fallbackOnline ? 'online' : 'offline'})`
      }));
      
      return fallbackOnline;
    }
  }, [config.endpoints, config.timeout, config.enableNetworkTests]);

  /**
   * Force an immediate connectivity check
   */
  const checkNow = useCallback(() => {
    return testConnectivity();
  }, [testConnectivity]);

  // Set up periodic connectivity checks
  useEffect(() => {
    // Initial check
    testConnectivity();
    
    // Set up interval for periodic checks
    const intervalId = setInterval(testConnectivity, config.checkInterval);
    
    return () => clearInterval(intervalId);
  }, [testConnectivity, config.checkInterval]);

  // Listen to browser online/offline events as additional signals
  useEffect(() => {
    const handleOnline = () => {
      // When browser reports online, do an immediate test
      testConnectivity();
    };
    
    const handleOffline = () => {
      // When browser reports offline, update status immediately
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date(),
        error: 'Browser reported offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [testConnectivity]);

  return {
    ...networkStatus,
    checkNow,
    // Utility methods
    isReliable: networkStatus.lastChecked !== null, // Has performed at least one actual test
    timeSinceLastCheck: networkStatus.lastChecked 
      ? Date.now() - networkStatus.lastChecked.getTime() 
      : null
  };
};

/**
 * Simple hook for components that only need the online status
 */
export const useIsOnline = (options?: UseNetworkStatusOptions) => {
  const { isOnline } = useNetworkStatus(options);
  return isOnline;
};