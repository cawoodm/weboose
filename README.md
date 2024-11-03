# WebOOSe
A Web Oriented Operating System (Extensible)

A WebOS is like a virtual machine which you can start from anywhere and do almost anything with. Similarly to an operating system on a PC it offers layers of functionality upon which to build useful apps.

Everything from the apps, down through the OS and the kernel live in the cloud and are synchronized to your browser as required.

## How it Works
A WebOS consists of 4 layers:
1. **BootLoader** which loads a...
2. **Kernel** which loads an...
3. **Operating System** which loads one or more **Extensions** including...
4. **Apps**!

## Kernel
The kernel is the first real code which runs after the boot loader. It's job is to provide basic functionality common to all operating systems including:
* Storage: Persistence of data and code (like a Harddrive)
* Events: A way for applications to communicate (like IPC)
* Package Management: A way to bundle and install/update/remove software or data

## Operating System
The operating system adds useful functions common to many applications such as:
* Store: Persistence of data and code (like a File System)
* Core Services: Functionality useful to many apps including
  * Remote Storage
  * Backups
* UI Framework: A base for apps to show data and functionality and allow interaction including:
  * Main Layout
  * Basic Events
  * Theming
* Application Management: A way to bundle and install/update/remove software or data

## OS Start Procedure
This simple script loads OS code from localStorage or, if it finds nothing, from a URL.

## Boot Load Procedure
This simple script loads kernel code from localStorage or, if it finds nothing, from a URL.
The boot loader needs 2 parameters in order to function normally:
1. The name of the kernel to load (e.g. `kernel.v0`)
2. The base URL where the kernel can be downloaded for install (e.g. `https://weboose.com/kernels`)
Once a kernel is installed in localStorage the URL is only required for updates.  
However, since localStorage is frequently cleared by browsers (every 7 days?) it is useful to have the URL.

The bootloader gets these 2 parameters from localStorage via the following keys:
* `/kernel.name` - the name of the kernel to load
* `/base.url` - the base URL for loading kernels

When your application is first started it is completely empty - the bootloader does not even know which kernel to load. Therefore you should provide defaults string values for both of these values or nothing will happen.

## Default Parameters
Here is an example of a minimal application:
```html
<html>
  <script src="boot.js"></script>
  <script>boot({kernel: {name: "kernel.latest", url: 'https://cawoodm.github.io/weboose/kernel/'}}); </script>
</html>
```
This provides a default kernel name and update URL for new users of your application.

To dynamically link such defaults see the section "Dynamic URLs" which follows.

### Dynamic URLs
Each of these parameters can be overridden via URL such that you can supply URL parameters.  
For example calling `http://localhost/?kernel=mykernel.v2&os=weboose.latest` will load `mykernel.v2` with the latest `weboose` regardless of what is configured or stored locally.
The possible parameters are:
* `kernel=` to specify/override kernel name (e.g. `kernel.v1`)
* `os=` to specify/override OS name (e.g. `weboose.v2`)
* `url=` to override baseUrl for kernel and OS (e.g. `https://mysite.org`)
* `nocache=X` to ignore local cache and always load kernel/OS from remote ite

### Kernel
A kernel is just a JavaScript which is run blindly by the boot loader. A useful kernel will however load an OS or operating system.

The weboose kernel reads `/default.os` to see which OS it should load.
