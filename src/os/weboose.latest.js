(function() {

  const OS_NAME = 'weboose';
  const OS_VERSION = '0.0.1';
  const RE_PLATFORM_NAME = /^[a-z0-9\.]{3,30}$/;
  const PLATFORM_FILENAME = '/platform.name';
  const PLATFORM_URL = '/base.url';

  let kernel;
  let qs;
  let osDefaults;
  let platformDefaults;
  let platformName;
  let baseUrl;
  let platformObject;

  return {
    name: OS_NAME,
    version: OS_VERSION,
    async init(p) {
      qs = p.qs;
      kernel = p.kernel;
      osDefaults = p.os;
      platformDefaults = p.platform || {};

      console.debug(`  OS: Operating System '${OS_NAME}' (v${OS_VERSION}) starting...`);
      document.title = 'WebOOSe';

      platformName = p.qs.platform || kernel.read(PLATFORM_FILENAME) || platformDefaults.name;
      if (!platformName.match(RE_PLATFORM_NAME)) throw new Error(`INVALID_PLATFORM_NAME: '${platformName}' is not a valid OS name!`);

      baseUrl = qs.pUrl || qs.url || kernel.read(PLATFORM_URL) || platformDefaults.url || p.base;
      if (!baseUrl.match(/^https?:\/\//)) throw new Error(`INVALID_PLATFORM_URL: '${baseUrl}' is not a valid URL!`);
      baseUrl = baseUrl.replace(/\/$/, '');

      console.debug(`  OS: Looking for local platform '${platformName}'...`);
      let platform = readObject('/platform/' + platformName);

      if (!platform.code || p.qs.reload || qs.update) {
        console.debug('  OS: No local platform found');
        // Load from URL
        if (!baseUrl) throw new Error('NO_PLATFORM_URL: Unable to determine URL to load platform from!');
        // Assume .js
        let osUrl = baseUrl + '/platform/' + platformName + '.js';
        let res = {};
        console.debug(`  OS: Installing platform from '${osUrl}'...`);
        try {res = await fetch(osUrl);} catch {}
        // Fallback to .json
        if (!res) try {let osUrl = baseUrl + platformName + '.json'; res = await fetch(osUrl);} catch {}
        try {
          if (!res.ok) throw new Error(`  OS: Unable to download platform from '${osUrl}' HTTP status: ${res.statusCode}`);
          if (res.headers.get('Content-Type')?.match(/\/javascript/)) platform.code = await res.text();
          else if (res.headers.get('Content-Type')?.match(/application\/json/)) {
            try {
              console.debug(`  OS: Loading platform '${platformName}'...`);
              platform = JSON.parse(await res.text());
            } catch (e){
              console.error(e.stack);
              platform.error = e;
            }
            if (platform.error)
              throw new Error(`INVALID_PLATFORM_JSON '${platformName}' ${platform.error.message}`);
          } else throw new Error(`PLATFORM_FORMAT_UNKNOWN: ${osUrl} is not served as JS/JSON`);
          kernel.write(PLATFORM_URL, baseUrl);
        } catch (e) {
          if (qs.update) console.warn(`OS_DOWNLOAD_ERROR: Unable to download OS from '${osUrl}' HTTP status: ${res.statusCode}`);
          else throw e;
        }
      }
      if (!platform.code)
        throw new Error(`PLATFORM_CODE_MISSING '${platformName}' has no code to run!`);

      kernel.write(PLATFORM_FILENAME, platformName);
      writeObject('/platform/' + platformName, platform);

      console.debug(`  OS: Executing platform '${platformName}'...`);
      await kernel.wrapSync(() => {
        platformObject = (1, eval)(platform.code);
      }, 'PLATFORM_FAILED');

      if (!platformObject) throw new Error('PLATFORM_NOT_RETURNED');
      if (!platformObject.init) throw new Error('PLATFORM_INVALID: No init() function found!');
      if (!platformObject.start) throw new Error('PLATFORM_INVALID: No start() function found!');
    },
    async start() {
      console.debug(`  OS: Initialising PLATFORM '${platformObject.name}' (v${platformObject.version}) ...`);
      const FS = '/platform/' + platformName;
      await kernel.wrapAsync(async () => {
        await platformObject.init({
          qs,
          platform: platformDefaults,
          base: baseUrl,
          os: {
            read(key, def) {
              return kernel.read(FS + key, def);
            },
            write(key, value) {
              return kernel.write(FS + key, value);
            },
          },
        });
      }, 'PLATFORM_INIT_FAILED');
      console.debug('  OS: Initialised OS');

      console.debug(`  OS: Starting platform '${platformName}'...`);
      // NOTE: If we try/catch here we lose all info in the console about where exactly the error occurred
      await kernel.wrapAsync(async () => {
        await platformObject.start();
      }, 'PLATFORM_START_FAILED');

      console.debug('  OS: Start complete.');
    },
  };
  function readObject(item) {
    let json = kernel.read(item);
    if (!json?.match(/^\{/)) return {};
    return JSON.parse(json);
  }
  function writeObject(item, value) {
    return kernel.write(item, JSON.stringify(value));
  }
})();
