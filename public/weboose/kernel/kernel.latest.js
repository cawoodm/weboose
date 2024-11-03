(function() {
  const KERNEL_VERSION = '0.0.0';
  const RE_OS_NAME = /^[a-z0-9\.]{3,30}$/;
  let kernel;
  let defaults;
  let osName;
  let baseUrl;
  let osObject;
  return {
    version: KERNEL_VERSION,
    async init(_kernel, _osDefaults) {
      kernel = _kernel;
      defaults = _osDefaults;

      console.debug(`KERNEL: Kernel '${kernel.meta.name}' (v${KERNEL_VERSION}) starting...`);

      const OS_FILENAME = '/os.name';

      osName = _kernel.params.os || read(OS_FILENAME, defaults.name);
      if (!osName.match(RE_OS_NAME)) throw new Error(`INVALID_OS_NAME: '${osName}' is not a valid OS name!`);
      baseUrl = _kernel.params.url || read('base.url', defaults.baseUrl);

      console.debug(`KERNEL: Looking for local OS '${osName}'...`);
      let os = readObject('/os/' + osName);

      console.log(kernel);

      if (!os.code || _kernel.params.nocache) {
        console.debug('KERNEL: No local OS found');
        // Load from URL
        if (!baseUrl) throw new Error('NO_OS_URL: Unable to determine URL to load OS from!');
        // Assume .js
        let osUrl = baseUrl + '/os/' + osName + '.js';
        let res = {};
        console.debug(`KERNEL: Installing from '${osUrl}'...`);
        try {res = await fetch(osUrl);} catch {}
        // Fallback to .json
        if (!res) try {let osUrl = baseUrl + osName + '.json'; res = await fetch(osUrl);} catch {}
        if (!res.ok) throw new Error(`OS: Unable to download OS from '${osUrl}' HTTP status: ${res.statusCode}`);
        if (res.headers.get('Content-Type')?.match(/text\/javascript/)) os.code = await res.text();
        else if (res.headers.get('Content-Type')?.match(/application\/json/)) {
          try {
            console.debug(`KERNEL: Loading os '${osName}'...`);
            os = JSON.parse(await res.text());
          } catch (e){
            console.error(e.stack);
            os.error = e;
          }
          if (os.error)
            throw new Error(`INVALID_OS_JSON '${osName}' ${os.error.message}`);
        } else throw new Error(`OS_FORMAT_UNKNOWN: ${osUrl} is not served as JS/JSON`);
      }
      if (!os.code)
        throw new Error(`OS_CODE_MISSING '${osName}' has no code to run!`);

      write(OS_FILENAME, osName);
      // write(KERNEL_URL, baseUrl);
      writeObject('/os/' + osName, os);

      console.debug(`KERNEL: Executing OS '${osName}'...`);
      try {
        osObject = (1, eval)(os.code);
      } catch (e) {
        console.error('OS_FAILED', e.message);
        throw (e);
      }

      if (!osObject) throw new Error('OS_NOT_RETURNED');
      if (!osObject.init) throw new Error('OS_INVALID: No init() function found!');
      if (!osObject.start) throw new Error('OS_INVALID: No start() function found!');
    },
    async start() {
      console.debug(`KERNEL: Initialising OS '${osName}'...`);
      // document.write(`Welcome to your kernel '${kernel.meta.name}' v${KERNEL_VERSION}... it does nothing yet!`);
      const FS = '/' + osName;
      try {
        await osObject.init({
          params: kernel.params,
          meta: {name: osName, baseUrl, kernel: {name: kernel.meta.name, baseUrl}},
          read(key, def) {
            return read(FS + key, def);
          },
          write(key, value) {
            return write(FS + key, value);
          },
        }, defaults);
      } catch (e) {
        console.error('OS_INIT_FAILED', e.message);
        throw (e);
      }
      console.debug('KERNEL: Initialised OS');

      console.debug(`KERNEL: Starting OS '${osName}'...`);
      try {
        osObject.start();
      } catch (e) {
        console.error('OS_START_FAILED', e.message);
        throw (e);
      }

      console.debug('KERNEL: Start complete.');
    },
  };
  function readObject(item) {
    let json = read(item);
    if (!json?.match(/^\{/)) return {};
    return JSON.parse(json);
  }
  function read(item, defaultValue) {
    return kernel.read(item, defaultValue);
  }
  function writeObject(item, value) {
    return write(item, JSON.stringify(value));
  }
  function write(item, value) {
    return kernel.write(item, value);
  }
})();
