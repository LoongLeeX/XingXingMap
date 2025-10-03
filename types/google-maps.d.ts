/**
 * Google Maps JavaScript API 类型声明
 */

/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};

