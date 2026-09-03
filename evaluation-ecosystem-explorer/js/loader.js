/* Evaluarium data loader.
 *
 * Centralizes the data-fetching contract for explorer.html, viewer.html,
 * and compare.html. Today every load is a static fetch from the
 * bundled data/ directory. At T2 (Pyodide-generated runs), loadRun()
 * grows a memory branch that returns in-memory blobs without touching
 * the call sites.
 *
 * Configuration sits in Evaluarium.config. To change where runs are
 * fetched from (CDN, HuggingFace, different mount point), change the
 * constants below rather than editing call sites.
 */
(function (root) {
  const config = {
    // Mount-point prefix. Leave '' to use relative-to-current-document
    // resolution -- the site works under any subpath (e.g. /evaluarium/)
    // without a rebuild. Only set this if you want fetches to target a
    // different origin from the page itself.
    basePath: '',
    // Where bundled run data lives, relative to basePath.
    dataPath: 'data/',
    // Top-level manifest of available runs.
    runsManifest: 'runs.json',
  };

  function url(rel) { return config.basePath + rel; }

  async function loadRunsManifest() {
    const resp = await fetch(url(config.runsManifest));
    if (!resp.ok) {
      const err = new Error('runs.json HTTP ' + resp.status);
      err.status = resp.status;
      throw err;
    }
    return resp.json();
  }

  async function loadRun(runPath) {
    const resp = await fetch(url(config.dataPath + runPath + '/frames.json'));
    if (!resp.ok) {
      const err = new Error('run HTTP ' + resp.status);
      err.status = resp.status;
      err.runPath = runPath;
      throw err;
    }
    return resp.json();
  }

  root.Evaluarium = { config, loadRunsManifest, loadRun };
})(window);
