#!/usr/bin/env bash
set -euo pipefail

# Generate PWA icons for Backlog Bunker from master white logo
# Uses macOS native `sips` (zero external dependencies)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
MASTER_LOGO="${ROOT_DIR}/public/logos/dnl-logo--white.png"
ICONS_DIR="${ROOT_DIR}/public/icons"
TEMP_DIR="${ROOT_DIR}/scratch"

if [ ! -f "${MASTER_LOGO}" ]; then
  echo "Error: Master logo not found at ${MASTER_LOGO}"
  exit 1
fi

mkdir -p "${ICONS_DIR}"
mkdir -p "${TEMP_DIR}"

echo "🎨 Generating PWA icons from ${MASTER_LOGO}..."

# 1. Standard square pad (#030712)
sips -p 2446 2446 --padColor 030712 "${MASTER_LOGO}" --out "${TEMP_DIR}/square-master.png" > /dev/null

# 2. icon-512.png & icon-192.png & apple-touch-icon.png
sips -Z 512 "${TEMP_DIR}/square-master.png" --out "${ICONS_DIR}/icon-512.png" > /dev/null
sips -Z 192 "${TEMP_DIR}/square-master.png" --out "${ICONS_DIR}/icon-192.png" > /dev/null
sips -Z 180 "${TEMP_DIR}/square-master.png" --out "${ICONS_DIR}/apple-touch-icon.png" > /dev/null

# 3. Maskable icon with 20% safe-zone margin (pad to 3200x3200 then scale to 512)
sips -p 3200 3200 --padColor 030712 "${MASTER_LOGO}" --out "${TEMP_DIR}/maskable-master.png" > /dev/null
sips -Z 512 "${TEMP_DIR}/maskable-master.png" --out "${ICONS_DIR}/icon-maskable-512.png" > /dev/null

# Cleanup
rm -f "${TEMP_DIR}/square-master.png" "${TEMP_DIR}/maskable-master.png"

echo "✅ PWA icons successfully generated in ${ICONS_DIR}:"
ls -la "${ICONS_DIR}"
