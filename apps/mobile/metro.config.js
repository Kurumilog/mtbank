const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const sharedAssetsPath = path.resolve(__dirname, "../../shared/assets");

config.watchFolders = [sharedAssetsPath];
config.resolver.assetExts = Array.from(new Set([...config.resolver.assetExts, "glb", "gltf"]));

module.exports = config;