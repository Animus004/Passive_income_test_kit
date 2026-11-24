/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(false);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
Config.setTimeoutInMilliseconds(120000);

// Cloud CI Puppeteer & Chromium configuration
if (process.env.PUPPETEER_EXECUTABLE_PATH) {
  Config.setBrowserExecutable(process.env.PUPPETEER_EXECUTABLE_PATH);
}

// Global GPU Acceleration for NVIDIA GeForce GTX 1660 SUPER (ANGLE / DirectX 11)
Config.setChromiumOpenGlRenderer("angle");
Config.setHardwareAcceleration("if-possible");

Config.setChromiumMultiProcessOnLinux(true);
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);
