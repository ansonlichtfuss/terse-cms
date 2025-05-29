# Patches Documentation

This document explains the purpose of custom patches applied to `node_modules` packages in this project.

## `gray-matter-casing-fix.patch`

**Issue:**
During the build process, a warning was encountered related to the `gray-matter` package (`gray-matter@4.0.3`). The warning indicated that there were multiple modules with names differing only in casing (`lib/Utils.js` and `lib/utils.js`). This can lead to unexpected behavior, especially on case-insensitive file systems (like macOS or Windows) and can cause build failures or inconsistencies.

The specific import causing the issue was found in `node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js`, where `utils` was imported from `./lib/Utils` (uppercase 'U'), while the actual file on disk was `lib/utils.js` (lowercase 'u').

**Solution:**
Since `gray-matter@4.0.3` is the latest version and the issue persists, a patch (`gray-matter-casing-fix.patch`) was created. This patch modifies `node_modules/.pnpm/gray-matter@4.0.3/node_modules/gray-matter/index.js` to change the import statement from `require('./lib/Utils')` to `require('./lib/utils')`, ensuring consistent casing.

**Application:**
The patch is automatically applied during the `pnpm install` process via a `postinstall` script in `package.json`. This ensures that the fix is in place whenever dependencies are installed or reinstalled.

**Why a patch?**
Directly modifying files in `node_modules` is not sustainable as changes are lost upon reinstallation. A patch provides a version-controlled and automated way to apply necessary fixes to third-party packages without forking them or waiting for an official upstream fix.
