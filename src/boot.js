/* eslint-disable complexity */

/**
 * BOOTLOADER (v0.0)
 * Boot loader which will run a kernel
 *  from localStorage or a URL
 * A kernel is just some code to run, it can be .js or wrapped in a basic object:
 * {
 *   "name": "weboose.v0",
 *   "version": "0.0.1",
 *   "url": "https://cawoodm.github.io/weboose/kernel.v0",
 *   "code": "console.log('hello from weboose!');"
 * }
 */
async function boot(k = {}) {

  const RE_KERNEL_NAME = /[a-z0-9\.]/;

  const BOOTLOADER_VERSION = '0.0';
  console.debug(`BOOT: Bootloader (v${BOOTLOADER_VERSION}) starting...`);

  // Kernel and URL can be overwridden via URL for easy up/down-grades:
  //  ?kernel=weboose.v1&url=https://mydomain.com/kernels/
  const qs = Object.fromEntries(new URLSearchParams(location.search));
  if (qs.kernel && !qs.kernel.match(RE_KERNEL_NAME)) throw new Error(`INVALID_KERNEL_NAME: '${qs.kernel}' is not a valid kernel name!`);
  if (qs.url && !qs.url.match(/^https?:\/\//)) throw new Error(`INVALID_KERNEL_URL: '${qs.url}' is not a valid URL!`);

  // Otherwise they are read from these 2 keys in localstorage
  const KERNEL_FILENAME = '/kernel.name';
  const KERNEL_URL = '/base.url';

  let kernelName = qs.kernel || read(KERNEL_FILENAME, k.name);
  if (!kernelName.match(RE_KERNEL_NAME)) throw new Error(`INVALID_KERNEL_NAME: '${kernelName}' is not a valid kernel name!`);
  let baseUrl = qs.url || read(KERNEL_URL, k.url);
  if (!baseUrl.match(/^https?:\/\//)) throw new Error(`INVALID_KERNEL_URL: '${baseUrl}' is not a valid URL!`);

  if (!kernelName && !baseUrl && kernel.default) {
    if (!confirm('No kernel settings found. Would you like to load a demo?')) throw new Error('KERNEL_SETTINGS_MISSING');
    kernelName = 'weboose.v0';
    baseUrl = 'https://cawoodm.github.io/weboose/kernels/';
  }

  let kernel = read('/kernels/' + kernelName) || {};

  if (!kernel.code) {
    // Load from URL
    if (!KERNEL_URL) throw new Error('NO_KERNEL_URL: Unable to determine URL to load kernel from!');
    // Assume .js
    let kernelUrl = baseUrl + kernelName + '.js';
    let res = {};
    try {res = await fetch(kernelUrl);} catch {}
    if (!res)
      // Fallback to .json
      try {let kernelUrl = baseUrl + kernelName + '.json'; res = await fetch(kernelUrl);} catch {}
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

  // The MAGIC happens here:
  console.debug(`BOOT: Executing kernel '${kernelName}'...`);
  (1, eval)(kernel.code);

  console.debug('BOOT: Boot complete.');

  function read(item, defaultValue) {
    return localStorage.getItem(item) || defaultValue;
  }
  function write(item, value) {
    return localStorage.setItem(item, value);
  }
}
