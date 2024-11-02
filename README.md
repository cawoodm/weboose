# WebOOSe
A Web Oriented Operating System (Extensible)

## Basics
A WebOS consists of 4 layers:
1. BootLoader which loads a...
2. Kernel which loads an...
3. OS which loads one or more...
4. Apps!

Your final use experience will be

### BootLoader
This simple script loads kernel code from localStorage or, if it finds nothing, from a URL.
The boot loader needs 2 parameters in order to function normally:
1. The name of the kernel to load (e.g. `weboose.v0`)
2. The base URL where the kernel can be downloaded for install (e.g. `https://weboose.com/kernels/`)
Once a kernel is installed in localStorage the URL is only required for updates.  
However, since localStorage is frequently cleared by browsers (every 7 days?) it is useful to have the URL.

The bootloader gets these 2 parameters from localStorage via the following keys:
* `/kernal.name` - the name of the kernel to load
* `/base.url` - the base URL for loading kernels

When your application is first started it is completely empty - the bootloader does not even know which kernel to load. Therefore you should provide defaults string values for both of these values or nothing will happen.

## Default Parameters
Here is an example of a minimal application:
```html
<html>
  <script src="boot.js"></script>
  <script>boot({kernel: {name: "weboose.v0", url: 'https://cawoodm.github.io/weboose/kernels/'}}); </script>
</html>
```
This provides a default kernel name and update URL for new users of your application.

To dynamically link such defaults see the section "Dynamic URLs" which follows.

### Dynamic URLs
Each of these parameters can be overridden via URL such that you can supply URL parameters.  
For example calling `http://localhost/?kernel=mykernel.v2` will load `mykernel.v2` regardless of what is configured.
Similarly calling `http://localhost/?kernel=mykernel.v3&url=https://mysite.org/kernels` will load `mykernel.v3` and use mysite.org for installing/updates.

### Kernel
A kernel is just a JavaScript which is run blindly by the boot loader. A useful kernel will however load an OS or operating system.

The weboose kernel reads `/default.os` to see which OS it should load.
