import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function GET() {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const PROJECT_DIR = process.cwd();
  const ZIP_NAME = "CrystalOne-Android.zip";
  const ZIP_PATH = path.join("/tmp", ZIP_NAME);
  const BUILD_DIR = path.join("/tmp", "crystal-android-build");

  try {
    if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
    if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true });
    fs.mkdirSync(BUILD_DIR, { recursive: true });

    const installScript = `#!/bin/bash
# ============================================================
#  Crystal One - Auto Installer for Android (Termux)
#  Compatible with Android 8 and above
# ============================================================

clear
echo ""
echo "  +------+  +--+--+  +------+  +------+  +--+--+  +------+"
echo "  |      |  |  |  |  |      |  |      |  |  |  |  |      |"
echo "  |  C   |  |  R  |  |  Y   |  |  S   |  |  T  |  |  A   |"
echo "  |      |  |  |  |  |      |  |      |  |  |  |  |      |"
echo "  +--+---+  +--+--+  +---+--+  +--+---+  +--+--+  +---+--+"
echo "  +---+--+  +--+--+  +--+---+  +---+--+"
echo "  |   |  |  |  |  |  |  |   |  |   |  |"
echo "  |   L  |  |  O  |  |  N   |  |   E  |"
echo "  |   |  |  |  |  |  |  |   |  |   |  |"
echo "  +---+--+  +--+--+  +--+---+  +---+--+"
echo ""
echo "  Crystal One Application Installer"
echo "  For Android 8+ (Termux)"
echo ""
echo "============================================================"
echo ""

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ] && [ ! -d "$HOME" ]; then
    echo "  [!] This installer is designed for Termux on Android."
    echo "  [!] Please install Termux from F-Droid first."
    echo ""
    exit 1
fi

# Step 1: Update packages
echo "  [1/5] Updating Termux packages..."
pkg update -y > /dev/null 2>&1
echo "        Done."

# Step 2: Install Node.js
if ! command -v node &> /dev/null; then
    echo "  [2/5] Installing Node.js..."
    pkg install nodejs -y > /dev/null 2>&1
    echo "        Done."
else
    echo "  [2/5] Node.js already installed (v$(node -v))"
fi

# Step 3: Install dependencies
echo "  [3/5] Installing application dependencies..."
cd "$(dirname "$0")"
npm install --legacy-peer-deps > /dev/null 2>&1
echo "        Done."

# Step 4: Build application
echo "  [4/5] Building Crystal One application..."
npm run build > /dev/null 2>&1
echo "        Done."

# Step 5: Create start shortcut
cat > ~/start-crystal.sh << 'LAUNCHER'
#!/bin/bash
clear
echo ""
echo "  Starting Crystal One..."
echo "  Open browser: http://localhost:3000"
echo ""
cd "$(dirname "$(readlink -f "$0")")/crystal-one" 2>/dev/null || cd ~/crystal-one
npm start
LAUNCHER
chmod +x ~/start-crystal.sh

# Copy app to home directory
INSTALL_DIR="$HOME/crystal-one"
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
fi
cp -r "$(dirname "$0")" "$INSTALL_DIR"

# Create shortcut alias
if ! grep -q "alias crystal=" ~/.bashrc 2>/dev/null; then
    echo 'alias crystal="bash ~/start-crystal.sh"' >> ~/.bashrc
fi

echo ""
echo "============================================================"
echo ""
echo "  Crystal One installed successfully!"
echo ""
echo "  To start the application:"
echo "    Option 1: bash ~/start-crystal.sh"
echo "    Option 2: type 'crystal' in Termux"
echo ""
echo "  Then open your browser and go to:"
echo "    http://localhost:3000"
echo ""
echo "  Admin login:"
echo "    Phone: 01026541250"
echo "    Password: abdallah"
echo ""
echo "============================================================"
echo ""

# Auto-start
read -p "  Start Crystal One now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash ~/start-crystal.sh
fi
`;
    fs.writeFileSync(path.join(BUILD_DIR, "install.sh"), installScript, "utf-8");

    const startScript = `#!/bin/bash
cd "$HOME/crystal-one" 2>/dev/null || cd "$(dirname "$0")"
npm start
`;
    fs.writeFileSync(path.join(BUILD_DIR, "start.sh"), startScript, "utf-8");

    const readmeContent = `# Crystal One - Android Installation

## Requirements
- Android 8 or higher
- Termux app (download from f-droid.org)

## Installation Steps

### Method 1: Automatic Install
1. Extract this ZIP file on your phone
2. Open Termux
3. Grant storage permission: \`termux-setup-storage\`
4. Navigate to extracted folder: \`cd ~/storage/downloads/CrystalOne-Android\`
5. Run installer: \`bash install.sh\`
6. Wait for installation to complete
7. Open browser: http://localhost:3000

### Method 2: Manual Install
1. Open Termux
2. Run: \`pkg install nodejs\`
3. Extract the ZIP file
4. Navigate to folder: \`cd ~/storage/downloads/CrystalOne-Android\`
5. Run: \`npm install\`
6. Run: \`npm run build\`
7. Run: \`npm start\`
8. Open browser: http://localhost:3000

## Starting After Installation
- Type \`crystal\` in Termux
- Or run: \`bash ~/start-crystal.sh\`

## Admin Login
- Phone: 01026541250
- Password: abdallah

## Note
- The app runs locally on your device
- Internet is only needed for the first installation
- All data is stored on your device
`;
    fs.writeFileSync(path.join(BUILD_DIR, "README.txt"), readmeContent, "utf-8");

    execSync(
      `cp -r "${PROJECT_DIR}/src" "${BUILD_DIR}/src" && ` +
      `cp "${PROJECT_DIR}/package.json" "${BUILD_DIR}/" && ` +
      `cp "${PROJECT_DIR}/package-lock.json" "${BUILD_DIR}/" 2>/dev/null; ` +
      `cp "${PROJECT_DIR}/next.config.ts" "${BUILD_DIR}/" && ` +
      `cp "${PROJECT_DIR}/tsconfig.json" "${BUILD_DIR}/" && ` +
      `cp "${PROJECT_DIR}/tailwind.config.ts" "${BUILD_DIR}/" && ` +
      `cp "${PROJECT_DIR}/postcss.config.mjs" "${BUILD_DIR}/" && ` +
      `cp "${PROJECT_DIR}/next-env.d.ts" "${BUILD_DIR}/" && ` +
      `chmod +x "${BUILD_DIR}/install.sh" && ` +
      `chmod +x "${BUILD_DIR}/start.sh" && ` +
      `rm -rf "${BUILD_DIR}/src/.next" 2>/dev/null; ` +
      `rm -rf "${BUILD_DIR}/src/node_modules" 2>/dev/null; ` +
      `rm -rf "${BUILD_DIR}/src/../data" 2>/dev/null; ` +
      `cd "${BUILD_DIR}/.." && zip -r "${ZIP_PATH}" CrystalOne-Android/`,
      { timeout: 60000 }
    );

    const zipBuffer = fs.readFileSync(ZIP_PATH);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${ZIP_NAME}"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
