(function() {
  const OS_NAME = 'twikki';
  const OS_VERSION = '0.0.0';
  let os;
  let defaults;
  let baseUrl;
  let osObject;
  return {
    version: OS_VERSION,
    async init(_os, _defaults) {
      os = _os;
      defaults = _defaults;

      console.debug(`OS: Operating System '${OS_NAME}' (v${OS_VERSION}) starting...`);

      console.debug('OS: Looking for local OS.Core...');
      let core = readObject('/core.js');

      baseUrl = _os.params.url || read('base.url', defaults.baseUrl);

      if (!core.code || _os.params.nocache) {
        console.debug('OS: No local OS.Core found');
        // Load from URL
        if (!baseUrl) throw new Error('NO_OS_URL: Unable to determine URL to load OS.Core from!');
        // Assume .js
        let osUrl = baseUrl + 'weboose/core.js';
        let res = {};
        console.debug(`OS: Installing Core from '${osUrl}'...`);
        try {res = await fetch(osUrl);} catch {}
        if (!res.ok) throw new Error(`OS: Unable to download OS.Core from '${osUrl}' HTTP status: ${res.statusCode}`);
        if (res.headers.get('Content-Type')?.match(/text\/javascript/)) os.code = await res.text();
        else if (res.headers.get('Content-Type')?.match(/application\/json/)) {
          try {
            console.debug(`OS: Loading os '${osName}'...`);
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

      console.debug(`OS: Executing OS '${osName}'...`);
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
      console.debug(`OS: Initialising OS '${osName}'...`);
      document.write(`Welcome to your OS '${OS_NAME}' v${OS_VERSION}... it does nothing yet!`);
      try {
        await osObject.init();
      } catch (e) {
        console.error('OS_INIT_FAILED', e.message);
        throw (e);
      }
      console.debug('OS: Initialised OS');

      console.debug(`OS: Starting OS '${osName}'...`);
      try {
        osObject.start();
      } catch (e) {
        console.error('OS_START_FAILED', e.message);
        throw (e);
      }

      console.debug('OS: Start complete.');
    },
  };
  function readObject(item) {
    let json = read(item);
    if (!json?.match(/^\{/)) return {};
    return JSON.parse(json);
  }
  function read(item, defaultValue) {
    return os.read(item, defaultValue);
  }
  function writeObject(item, value) {
    return write(item, JSON.stringify(value));
  }
  function write(item, value) {
    return os.write(item, value);
  }
})();
