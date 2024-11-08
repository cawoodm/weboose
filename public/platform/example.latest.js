(function() {

  const LOG = '    PLATFORM:';
  const PLATFORM_NAME = 'example';
  const PLATFORM_VERSION = '0.0.0';

  let qs;
  let os;
  let defaults;
  let baseUrl;
  let coreObject;

  return {
    name: PLATFORM_NAME,
    version: PLATFORM_VERSION,
    async init(p) {
      qs = p.qs;
      os = p.os;
      defaults = p.platform;

      console.debug(`${LOG} Platform '${PLATFORM_NAME}' (v${PLATFORM_VERSION}) starting...`);

      console.debug(`${LOG} Looking for local EXAMPLE.Core...`);
      let core = readObject('/packages/core.js');
      baseUrl = qs.pUrl || qs.url || os.read('base.url') || p.base;

      if (!core?.code || p.qs.reload) {
        console.debug(`${LOG} No local core found`);
        core = await loadPackage('/core', baseUrl);
      }

      console.debug(`${LOG} Executing EXAMPLE.Core...`);
      coreObject = (1, eval)(core.code);

      console.debug(`${LOG} Initialising EXAMPLE.Core...`);
      await coreObject.init();

      os.write('/base.url', baseUrl);
      writeObject('/packages/core.js', core);

    },
    // eslint-disable-next-line require-await
    async start() {
      console.debug(`${LOG} Initialising Platform '${PLATFORM_NAME}'...`);
      document.write(`Welcome to your platform '${PLATFORM_NAME}' v${PLATFORM_VERSION}... it does nothing yet!`);
      // Here you could create a DOM from nothing or...
      // Do it via objects previously loaded:
      coreObject.start();
      console.debug(`${LOG} Platform start complete.`);
    },
  };
  async function loadPackage(packageName, baseUrl) {
    if (!baseUrl) throw new Error('NO_PACKAGE_URL: Unable to determine URL to load package from!');
    // Assume .js
    let packageUrl = baseUrl + '/packages' + packageName + '.js';
    let res = {};
    console.debug(`      EXAMPLE: Installing package from '${packageUrl}'...`);
    try {res = await fetch(packageUrl);} catch {}
    // Fallback to .json
    if (!res) try {let packageUrl = baseUrl + packageName + '.json'; res = await fetch(packageUrl);} catch {}
    if (!res.ok) throw new Error(`      EXAMPLE: Unable to download package from '${packageUrl}' HTTP status: ${res.statusCode}`);
    if (res.headers.get('Content-Type')?.match(/\/javascript/)) res.code = await res.text();
    else if (res.headers.get('Content-Type')?.match(/application\/json/)) {
      try {
        console.debug(`      EXAMPLE: Loading package '${packageName}'...`);
        res = JSON.parse(await res.text());
      } catch (e){
        console.error(e.stack);
        res.error = e;
      }
      if (res.error)
        throw new Error(`INVALID_PACKAGE_JSON '${packageName}' ${res.error.message}`);
    } else throw new Error(`PACKAGE_FORMAT_UNKNOWN: ${packageUrl} is not served as JS/JSON`);
    if (!res.code)
      throw new Error(`PACKAGE_CODE_MISSING '${packageName}' has no code to run!`);
    return res;
  }
  function readObject(item) {
    let json = os.read(item);
    if (!json?.match(/^\{/)) return {};
    return JSON.parse(json);
  }
  function writeObject(item, value) {
    return os.write(item, JSON.stringify(value));
  }
})();
