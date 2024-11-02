/**
 * BOOTLOADER (v0.0)
 * Boot loader which will run a kernel
 *  from localStorage or a URL
 * A kernel is just some code to run, wrapped in a basic object:
 * {
 *   "name": "weboose.v0",
 *   "version": "0.0.1",
 *   "url": "https://cawoodm.github.io/weboose/kernel.v0.js",
 *   "code": "console.log('hello from weboose!');"
 * }
 */
(async function() {

  const BOOTLOADER_VERSION = "0.0";
  console.debug(`BOOT: Bootloader starting...`);
  
  // The default kernel to load
  const DEFAULT_KERNEL = "weboose.v0";
  // Can be overwritten by setting:
  const KERNEL_FILENAME = "_weboose.kernel.load";
  // Namespace for all kernels
  const KERNEL_PREFIX = "_weboose.kernels.";
  // URL for all kernels
  const KERNEL_URL = "https://cawoodm.github.io/weboose/";
  
  let kernelToLoad = read(KERNEL_NAME, DEFAULT_KERNEL);
  let kernelMeta = read(KERNEL_PREFIX + kernelToLoad);
  if (!kernelMeta) {
    let kernelUrl = KERNEL_URL + kernelToLoad + `.json`;
    let res = await fetch(kernelUrl);
    if (!res.ok) throw new Error(`KERNEL_DOWNLOAD_ERROR: Unable to download kernel from '${kernelUrl}' HTTP status: ${res.statusCode}`);
    if (!res.headers['content-type']?.match(/application\/json/)) console.warn(`KERNEL_MUST_BE_JSON: ${kernelUrl} is not served as JSON`);
    kernalMeta = await res.text();
  }
  
  if (!kernelMeta) throw new Error("KERNEL_FOUND");

  try {
    console.debug(`BOOT: Loading kernel '${kernelToLoad}'...`);
    kernelMeta = JSON.parse(kernelCode);
  }catch(e){
    console.error(e.stack);
    kernelMeta.error = e;
  }
  if (kernelMeta.error)
    throw new Error(`INVALID_KERNEL_JSON '${kernelToLoad}' ${kernelMeta.error.message}`);
  if (!kernelMeta.code)
    throw new Error(`KERNEL_CODE_MISSING '${kernelToLoad}' has no code to run!`);
  
  // The MAGIC happens here:
  console.debug(`BOOT: Executing kernel '${kernelToLoad}'...`);
  (1, eval)(kernelMeta.code);
  
  console.debug(`BOOT: Boot complete.`);

  function read(item, defaultValue) {
    return localStorage.getItem(item) || defaultValue;
  }
})();