

/**
 * BOOTLOADER (v0.0)
 * Boot loader which will run a kernel
 *  from localStorage or a URL
 * A kernel is just some code to run, it can be .js or wrapped in a basic object:
 * {
 *   "name": "kernel.v0",
 *   "version": "0.0.1",
 *   "url": "https://cawoodm.github.io/weboose/kernel.v0.js",
 *   "code": "console.log('hello from weboose!');"
 * }
 */
async function boot(kernelDefaults = {}, osDefaults = {}) {

  const RE_KERNEL_NAME = /^[a-z0-9\.]{3,30}$/;
  const FS = '/';

  const BOOTLOADER_VERSION = '0.0';
  console.debug(`BOOT: Bootloader (v${BOOTLOADER_VERSION}) starting...`);

  // Kernel and URL can be overwridden via URL for easy up/down-grades:
  //  ?kernel=weboose.v1&url=https://mydomain.com/kernel/
  const qs = Object.fromEntries(new URLSearchParams(location.search));
  if (qs.kernel && !qs.kernel.match(RE_KERNEL_NAME)) throw new Error(`INVALID_KERNEL_NAME: '${qs.kernel}' is not a valid kernel name!`);
  if (qs.url && !qs.url.match(/^https?:\/\//)) throw new Error(`INVALID_KERNEL_URL: '${qs.url}' is not a valid URL!`);

  // Otherwise they are read from these 2 keys in localstorage
  const KERNEL_FILENAME = '/kernel.name';
  const KERNEL_URL = '/base.url';

  let kernelName = qs.kernel || read(KERNEL_FILENAME, kernelDefaults.name);
  if (!kernelName.match(RE_KERNEL_NAME)) throw new Error(`INVALID_KERNEL_NAME: '${kernelName}' is not a valid kernel name!`);
  let baseUrl = qs.url || read(KERNEL_URL, kernelDefaults.url);
  if (!baseUrl.match(/^https?:\/\//)) throw new Error(`INVALID_KERNEL_URL: '${baseUrl}' is not a valid URL!`);

  if (!kernelName && !baseUrl && kernel.default) {
    if (!confirm('No kernel settings found. Would you like to load a demo?')) throw new Error('KERNEL_SETTINGS_MISSING');
    kernelName = 'weboose.latest';
    baseUrl = 'https://cawoodm.github.io/weboose/kernel/';
  }

  console.debug(`BOOT: Looking for local kernel '${kernelName}'...`);
  let kernel = readObject('/kernels/' + kernelName, {});

  if (!kernel.code || qs.nocache) {
    // Load from URL
    console.debug('BOOT: No local kernel found');
    if (!KERNEL_URL) throw new Error('NO_KERNEL_URL: Unable to determine URL to load kernel from!');
    // Assume .js
    let kernelUrl = baseUrl + 'kernel/' + kernelName + '.js';
    let res = {};
    console.debug(`BOOT: Installing from '${kernelUrl}'...`);
    try {res = await fetch(kernelUrl);} catch {}
    // Fallback to .json
    if (!res) try {let kernelUrl = baseUrl + kernelName + '.json'; res = await fetch(kernelUrl);} catch {}
    if (!res.ok) throw new Error(`KERNEL_DOWNLOAD_ERROR: Unable to download kernel from '${kernelUrl}' HTTP status: ${res.statusCode}`);
    if (res.headers.get('Content-Type')?.match(/text\/javascript/)) kernel.code = await res.text();
    else if (res.headers.get('Content-Type')?.match(/application\/json/)) {
      try {
        console.debug(`BOOT: Loading kernel '${kernelName}'...`);
        kernel = JSON.parse(await res.text());
      } catch (e){
        console.error(e.stack);
        kernel.error = e;
      }
      if (kernel.error)
        throw new Error(`INVALID_KERNEL_JSON '${kernelName}' ${kernel.error.message}`);
    } else throw new Error(`KERNEL_FORMAT_UNKNOWN: ${kernelUrl} is not served as JS/JSON`);
  }

  if (!kernel.code)
    throw new Error(`KERNEL_CODE_MISSING '${kernelName}' has no code to run!`);

  write(KERNEL_FILENAME, kernelName);
  write(KERNEL_URL, baseUrl);
  writeObject('/kernels/' + kernelName, kernel);

  // The MAGIC happens here:
  console.debug(`BOOT: Executing kernel '${kernelName}'...`);
  let kernelObject;
  try {
    // TODO: Run differently so we get line numbers?
    kernelObject = (1, eval)(kernel.code);
  } catch (e) {
    console.error('KERNEL_FAILED', e);
    throw (e);
  }

  if (!kernelObject) throw new Error('KERNEL_NOT_RETURNED: The kernel');
  if (!kernelObject.init) throw new Error('KERNEL_INVALID: No init() function found!');
  if (!kernelObject.start) throw new Error('KERNEL_INVALID: No start() function found!');

  console.debug('BOOT: Initialising kernel...');
  try {
    await kernelObject.init({
      params: qs,
      meta: {name: kernelName, baseUrl},
      read(key, def) {
        return read(FS + key, def);
      },
      write(key, value) {
        return write(FS + key, value);
      },
    }, osDefaults);
    console.debug('BOOT: Kernel initialised.');
  } catch (e) {
    console.error('KERNEL_INIT_FAILED', e.message);
    throw (e);
  }

  console.debug('BOOT: Starting kernel...');
  console.debug('BOOT: Starting kernel...');
  try {
    kernelObject.start();
    // Note: we do not wait for the kernel to start, our job is done!
  } catch (e) {
    console.error('KERNEL_START_FAILED', e.message);
    throw (e);
  }

  console.debug('BOOT: Boot complete.');

  function readObject(item) {
    let json = read(item);
    if (!json?.match(/^\{/)) return {};
    return JSON.parse(json);
  }
  function read(item, defaultValue) {
    return localStorage.getItem(item) || defaultValue;
  }
  function writeObject(item, value) {
    return write(item, JSON.stringify(value));
  }
  function write(item, value) {
    return localStorage.setItem(item, value);
  }
}
