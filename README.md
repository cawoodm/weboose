# WebOOSe
A Web Oriented Operating System (Extensible)

A WebOS is like a virtual machine which you can start from anywhere and do almost anything with. Similarly to an operating system on a PC it offers layers of functionality upon which to build useful apps.

Everything from the apps, down through the OS and the OS live in the cloud and are synchronized to your browser as required.

## How it Works
A WebOS consists of 4 layers:
1. **BootLoader** which loads an...
2. **Operating System** which loads a...
3. **Platform** including **Extensions** and...
4. **Apps**

The most basic concept is that all your data and code is cached locally in the browser's "localStorage" but will be synched with some cloud service. This could be any API reachable via HTTP where JSON data can be stored and retrieved.

## BootLoader
The boot loader has 2 functions:
* Find and load an OS
* Provide a simple storage API for the OS
If the boot loader finds a local OS it will load it, otherwise it will install one. See below "Boot Load Procedure" for more details.

## OS
The OS is the first real code which runs after the boot loader. It's job is to provide basic functionality common to all applications including:
* Events: A way for applications to communicate (like IPC)
* Package Management: A way to bundle and install/update/remove software or data
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
This simple script loads OS code from localStorage or, if it finds nothing, from a URL.
The boot loader needs 2 parameters in order to function normally:
1. The name of the OS to load (e.g. `weboose.v0`)
2. The base URL where the OS can be downloaded for install (e.g. `https://weboose.com/os`)
Once a OS is installed in localStorage the URL is only required for updates.  
However, since localStorage is frequently cleared by browsers (every 7 days?) it is useful to have the URL.

The bootloader gets these 2 parameters from localStorage via the following keys:
* `/os.name` - the name of the OS to load
* `/base.url` - the base URL for loading os

When your application is first started it is completely empty - the bootloader does not even know which OS to load. Therefore you should provide defaults string values for both of these values or nothing will happen. Of course you can set these manually in localStorage if you choose however it can be done in HTML/JS or via the URL (see "Dynamic URLs" below).

## Default Parameters
Here is an example of a minimal application:
```html
<html>
  <script src="boot.js"></script>
  <script>boot({base: "https://cawoodm.github.io/weboose/", os: {name: "weboose.latest"}}); </script>
</html>
```
This provides a default OS name and update URL for new users of your application.

To dynamically link such defaults see the section "Dynamic URLs" which follows.

### Dynamic URLs
Each of these parameters can be overridden via URL such that you can supply URL parameters.  
For example calling `http://localhost/?os=myweboose.v2&os=weboose.latest` will load `myweboose.v2` with the latest `weboose` regardless of what is configured or stored locally.
The posible parameters are:
* `os=` to specify/override OS name (e.g. `weboose.v1`)
* `platform=` to specify/override Platform name (e.g. `twikki.v2`)
* `url=` to override baseUrl for OS and Platform (e.g. `https://mysite.org`)
* `oUrl=` to override baseUrl for bootloader to find OS (e.g. `https://mysite.org`)
* `pUrl=` to override baseUrl for OS to find platform (e.g. `https://mysite.org`)
* `reload=X` to ignore local cache and always load os/OS from remote ite

### Kernel
A OS is just a JavaScript which is run blindly by the boot loader. A useful OS will however load an OS or operating system.

The weboose OS reads `/default.os` to see which OS it should load.
