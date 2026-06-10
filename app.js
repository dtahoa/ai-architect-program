(function () {
  var files = (window.SITE_FILES || []).slice().sort(function (a, b) {
    return a.path.localeCompare(b.path);
  });
  var filePaths = new Set(files.map(function (file) { return file.path; }));
  var view = document.getElementById("view");
  var breadcrumbs = document.getElementById("breadcrumbs");
  var folderNav = document.getElementById("folder-nav");
  var searchInput = document.getElementById("file-search");
  var directoryPaths = buildDirectoryPaths(files);

  renderFolderNav();
  window.addEventListener("hashchange", route);
  searchInput.addEventListener("input", function () {
    renderDirectory(currentPath());
  });
  route();

  function currentPath() {
    var raw = window.location.hash.replace(/^#\/?/, "");
    return normalizePath(decodeURIComponent(raw));
  }

  function route() {
    var path = currentPath();
    renderBreadcrumbs(path);
    renderFolderNav(path);

    if (!path || directoryPaths.has(path)) {
      renderDirectory(path);
      return;
    }

    if (filePaths.has(path)) {
      renderFile(path);
      return;
    }

    renderError("That file or folder is not in the site index.", path);
  }

  function buildDirectoryPaths(sourceFiles) {
    var paths = new Set([""]);
    sourceFiles.forEach(function (file) {
      var parts = file.path.split("/");
      for (var index = 1; index < parts.length; index += 1) {
        paths.add(parts.slice(0, index).join("/"));
      }
    });
    return paths;
  }

  function renderFolderNav(activePath) {
    var folders = Array.from(directoryPaths).sort(function (a, b) {
      if (a === "") return -1;
      if (b === "") return 1;
      return a.localeCompare(b);
    });

    folderNav.innerHTML = folders.map(function (folder) {
      var label = folder || "Root";
      var isActive = normalizePath(activePath || "") === folder;
      return '<a class="folder-link' + (isActive ? " active" : "") + '" href="#/' + encodePath(folder) + '">' +
        escapeHtml(label) +
        "</a>";
    }).join("");
  }

  function renderBreadcrumbs(path) {
    var normalized = normalizePath(path);
    var parts = normalized ? normalized.split("/") : [];
    var crumbs = ['<a class="crumb" href="#/">Root</a>'];
    var built = "";

    parts.forEach(function (part, index) {
      built = built ? built + "/" + part : part;
      crumbs.push('<span class="crumb-separator">/</span>');
      if (index === parts.length - 1 && filePaths.has(normalized)) {
        crumbs.push('<span>' + escapeHtml(part) + "</span>");
      } else {
        crumbs.push('<a class="crumb" href="#/' + encodePath(built) + '">' + escapeHtml(part) + "</a>");
      }
    });

    breadcrumbs.innerHTML = crumbs.join("");
  }

  function renderDirectory(path) {
    var normalized = normalizePath(path);
    var query = searchInput.value.trim().toLowerCase();
    var children = getChildren(normalized);
    var matchingFiles = query ? files.filter(function (file) {
      return file.path.toLowerCase().includes(query);
    }) : [];

    if (!normalized && !query) {
      view.innerHTML = renderHero() + renderDirectoryBody("", children, "Root");
      return;
    }

    if (query) {
      view.innerHTML = renderDirectoryBody("", {
        folders: [],
        files: matchingFiles
      }, 'Search results for "' + searchInput.value.trim() + '"');
      return;
    }

    view.innerHTML = renderDirectoryBody(normalized, children, normalized || "Root");
  }

  function renderHero() {
    return '<section class="hero">' +
      "<div>" +
      "<h1>Browse the AI Architect Program from the root.</h1>" +
      "<p>Open folders, read Markdown files, and use the breadcrumb trail to move back through nested paths.</p>" +
      "</div>" +
      '<div class="stats">' +
      '<div class="stat"><strong>' + files.length + '</strong><span>files indexed</span></div>' +
      '<div class="stat"><strong>' + Math.max(directoryPaths.size - 1, 0) + '</strong><span>folders</span></div>' +
      '<div class="stat"><strong>1</strong><span>static GitHub Pages app</span></div>' +
      "</div>" +
      "</section>";
  }

  function renderDirectoryBody(path, children, title) {
    var folders = children.folders.map(function (folder) {
      var label = folder.split("/").pop();
      return renderEntry(folder, label, "DIR", countFilesInFolder(folder) + " files");
    }).join("");

    var listedFiles = children.files.map(function (file) {
      var label = file.path.split("/").pop();
      return renderEntry(file.path, label, fileType(file.path), file.path);
    }).join("");

    return '<section class="directory-view">' +
      '<div class="directory-head"><div><h1>' + escapeHtml(title) + '</h1><p>' +
      directorySummary(children) +
      "</p></div></div>" +
      '<div class="grid">' + (folders + listedFiles || '<div class="empty">No files found.</div>') + "</div>" +
      "</section>";
  }

  function getChildren(path) {
    var prefix = path ? path + "/" : "";
    var folders = new Set();
    var childFiles = [];

    files.forEach(function (file) {
      if (!file.path.startsWith(prefix)) return;
      var rest = file.path.slice(prefix.length);
      if (!rest) return;
      var slash = rest.indexOf("/");
      if (slash === -1) {
        childFiles.push(file);
      } else {
        folders.add(prefix + rest.slice(0, slash));
      }
    });

    return {
      folders: Array.from(folders).sort(),
      files: childFiles.sort(function (a, b) { return a.path.localeCompare(b.path); })
    };
  }

  function renderEntry(path, label, icon, detail) {
    return '<a class="entry" href="#/' + encodePath(path) + '">' +
      '<span class="entry-icon">' + escapeHtml(icon) + "</span>" +
      "<span><strong>" + escapeHtml(label) + "</strong><small>" + escapeHtml(detail) + "</small></span>" +
      "</a>";
  }

  function directorySummary(children) {
    var folderCount = children.folders.length;
    var fileCount = children.files.length;
    return folderCount + " folder" + (folderCount === 1 ? "" : "s") + " and " +
      fileCount + " file" + (fileCount === 1 ? "" : "s");
  }

  function countFilesInFolder(path) {
    var prefix = path + "/";
    return files.filter(function (file) { return file.path.startsWith(prefix); }).length;
  }

  function renderFile(path) {
    view.innerHTML = '<section class="document-view"><div class="document-header">' +
      "<h1>" + escapeHtml(path.split("/").pop()) + "</h1>" +
      '<a class="button-link" href="' + encodePath(path) + '" target="_blank" rel="noopener">Open raw</a>' +
      '</div><div class="markdown">Loading...</div></section>';

    fetch(encodePath(path))
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (text) {
        var body = document.querySelector(".document-view .markdown");
        if (/\.md$/i.test(path)) {
          body.innerHTML = renderMarkdown(text, path);
        } else {
          body.className = "plain-text";
          body.textContent = text;
        }
      })
      .catch(function () {
        renderError("The file is indexed, but GitHub Pages could not load it.", path);
      });
  }

  function renderMarkdown(markdown, currentFile) {
    var lines = markdown.replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var paragraph = [];
    var list = null;
    var code = null;

    function flushParagraph() {
      if (!paragraph.length) return;
      html.push("<p>" + renderInline(paragraph.join(" "), currentFile) + "</p>");
      paragraph = [];
    }

    function flushList() {
      if (!list) return;
      html.push("<" + list.type + ">" + list.items.join("") + "</" + list.type + ">");
      list = null;
    }

    lines.forEach(function (line) {
      var fence = line.match(/^```(.*)$/);
      if (fence && !code) {
        flushParagraph();
        flushList();
        code = [];
        return;
      }
      if (fence && code) {
        html.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
        code = null;
        return;
      }
      if (code) {
        code.push(line);
        return;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList();
        return;
      }

      var heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        flushParagraph();
        flushList();
        var level = heading[1].length;
        html.push("<h" + level + ">" + renderInline(heading[2], currentFile) + "</h" + level + ">");
        return;
      }

      var quote = line.match(/^>\s?(.*)$/);
      if (quote) {
        flushParagraph();
        flushList();
        html.push("<blockquote>" + renderInline(quote[1], currentFile) + "</blockquote>");
        return;
      }

      var unordered = line.match(/^\s*[-*]\s+(.*)$/);
      var ordered = line.match(/^\s*\d+\.\s+(.*)$/);
      if (unordered || ordered) {
        flushParagraph();
        var type = unordered ? "ul" : "ol";
        if (!list || list.type !== type) flushList();
        if (!list) list = { type: type, items: [] };
        list.items.push("<li>" + renderInline((unordered || ordered)[1], currentFile) + "</li>");
        return;
      }

      paragraph.push(line.trim());
    });

    flushParagraph();
    flushList();
    if (code) html.push("<pre><code>" + escapeHtml(code.join("\n")) + "</code></pre>");
    return html.join("\n");
  }

  function renderInline(text, currentFile) {
    var escaped = escapeHtml(text);
    escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, href) {
      var cleanHref = decodeHtmlEntities(href.replace(/^&lt;|&gt;$/g, ""));
      var resolved = resolveInternalLink(cleanHref, currentFile);
      if (resolved) {
        return '<a href="#/' + encodePath(resolved) + '">' + label + "</a>";
      }
      return '<a href="' + escapeHtml(cleanHref) + '" target="_blank" rel="noopener">' + label + "</a>";
    });
    return escaped;
  }

  function resolveInternalLink(href, currentFile) {
    if (/^(https?:|mailto:|#)/i.test(href)) return "";
    var target = href.split("#")[0];
    if (!target) return "";
    var base = currentFile.split("/").slice(0, -1).join("/");
    var resolved = normalizePath((base ? base + "/" : "") + target);
    return filePaths.has(resolved) ? resolved : "";
  }

  function renderError(message, path) {
    view.innerHTML = '<section class="error-view"><h1>Not found</h1><p>' +
      escapeHtml(message) + '</p><p><code>' + escapeHtml(path || "/") +
      '</code></p><p><a class="button-link" href="#/">Back to root</a></p></section>';
  }

  function fileType(path) {
    var extension = path.split(".").pop().toUpperCase();
    return extension.length <= 4 ? extension : "FILE";
  }

  function normalizePath(path) {
    var parts = [];
    (path || "").replace(/\\/g, "/").split("/").forEach(function (part) {
      if (!part || part === ".") return;
      if (part === "..") {
        parts.pop();
      } else {
        parts.push(part);
      }
    });
    return parts.join("/");
  }

  function encodePath(path) {
    return (path || "").split("/").map(encodeURIComponent).join("/");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function decodeHtmlEntities(value) {
    return String(value)
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}());
