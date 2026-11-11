/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Cloud CI Puppeteer & Chromium configuration
if (process.env.PUPPETEER_EXECUTABLE_PATH) {
  Config.setBrowserExecutable(process.env.PUPPETEER_EXECUTABLE_PATH);
}

Config.setChromiumMultiProcessOnLinux(true);
Config.setChromiumDisableWebSecurity(true);
Config.setChromiumHeadlessMode(true);
