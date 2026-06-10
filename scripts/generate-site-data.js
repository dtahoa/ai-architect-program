const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const excludedDirectories = new Set([".git", "node_modules", "scripts"]);
const excludedFiles = new Set(["index.html", "styles.css", "app.js", "site-data.js"]);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".")) return [];

    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, absolutePath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) return [];
      return walk(absolutePath);
    }

    if (!entry.isFile() || excludedFiles.has(entry.name)) return [];

    return [{ path: relativePath, type: "file" }];
  });
}

const files = walk(root).sort((a, b) => a.path.localeCompare(b.path));
const output = `window.SITE_FILES = ${JSON.stringify(files, null, 2)};\n`;

fs.writeFileSync(path.join(root, "site-data.js"), output);
console.log(`Indexed ${files.length} files in site-data.js`);
