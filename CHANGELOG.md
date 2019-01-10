# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- change log

### Changed
- upgrade to Electron v4.0.1, Node v10.11.0, Chromium v69.0.3497.106
- repository structure

### Deprecated

### Removed
- wrapper scripts for launching the kiosk-browser in different modes

### Fixed
### Security

## [0.10.0] - 2019-01-07
### Added
- verbose mode for `-V` for printing Electron, Node and Chromium versions
- redistributables building for all platforms supported by electron-builder

### Changed
- upgrade to Electron v3.0.13, Node v10.2.0, Chromium v66.0.3359.181
- set default verbosity level to 0


## [0.9.12] - 2018-12-01
### Added
- screen tearing test in test application
- link to simple multi-touch drawing web application


## [0.9.11] - 2018-12-01
### Added
- `-s`/`--serve` command line option to serve static files via built-in HTTP server (#24)

### Changed
- decouple developer tools and remote debugging CLI options
- set default remote debugging port to 9222
- remove --testapp and default of -l/--url in favor of special kiosk://testapp and kiosk://home urls

### Removed
- remaining index-page related menu items

### Fixed
- ensure chrome flags set early enough during initialization
- skippinmg of first CLI option when app is packaged (#25)


## [0.9.10] - 2018-04-24
### Fixed
- fullscreen mode on plain X11 systems without a window manager


## [0.9.9] - 2018-04-18
### Added
- sound test application that plays audio files provided via URL parameter

### Fixed
- do not reload if page loading fails due to user interaction


## [0.9.8] - 2018-03-07
### Added
- support preloading node-enabled JavaScript code via  `--preload`
- always-on-top mode via `--always-on-top`
- localhost mode that restricts connections to http(s)://localhost
- retry on failed page loadings (see `--retry`)
- support passing command line options to Chromium via `--append-chrome-switch`, `--append-chrome-argument` and `--use-minimal-chrome-cli`
- display V8 version in test application

### Changed
- update Electron to v1.7.12
- detect up to 51 touch points in test application
- migrate repository to https://github.com/IMAGINARY/kiosk-browser

### Remove
- Dockerfile support
- heartbeat library integration (can be replaced by `--preload` mechanism)
- support for passing command line options formatted in camel-case

### Fixed
- loading of defaults for settings not present in the user's local configuration


## [0.9.7] - 2017-12-22
### Added
- also install kiosk browser v0.9.0 via Dockerfile

### Changed
- disable touch events by default


## [0.9.5] - 2017-10-12
### Added
- remote debugging support


## [0.9.4] - 2017-07-31
### Fixed
- issues with application shutdown


## [0.9.3] - 2017-07-30
### Added
- display host name, date and time in test application
- display active and passive network interfaces in test application
- forward localization settings into Docker container

### Changed
- upgrade Electron from ^1.6.2 to ^1.7.5
- increase output level of sound samples in test application
- span all detected displays


## [0.9.2] - 2017-05-30
### Added
- Dockerfile support for PulseAudio and ALSA

### Changed
- detect up to 10 touch points in test application
- set MFO logo as application icon


## [0.9.1] - 2017-05-25
### Added
- [library for sending heartbearts] to a heartbeat server
- audio test to test application

### Changed
- restrict building of redistributables to the amd64 Linux platform

### Removed
- screen and network information from the index document


## [0.9.0] - 2017-05-02
### Added
- test mode for touch input, mouse input, screen properties and network connectivity
- command line arguments for zoom, menu, kiosk-mode and fullscreen

### Changed
- defaults of command line arguments
- wrapper scripts improvements
- install Debian package into docker image instead of including the source code


## [0.1.1] - 2015-10-11
### Added
- multi-touch support
- additional links for testing html5, webgl and multi-touch
- basic menu

### Changed
- default set of Chromium command line switches


## [0.1.0] - 2015-09-22
### Added
- Basic kiosk browser functionality

[library for sending heartbearts]: https://github.com/hilbert/hilbert-heartbeat

[Unreleased]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.10.0...HEAD
[0.10.0]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.12...v0.10.0
[0.9.12]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.11...v0.9.12
[0.9.11]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.10...v0.9.11
[0.9.10]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.9...v0.9.10
[0.9.9]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.8...v0.9.9
[0.9.8]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.7...v0.9.8
[0.9.7]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.5...v0.9.7
[0.9.5]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.4...v0.9.5
[0.9.4]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.3...v0.9.4
[0.9.3]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.1.1...v0.9.0
[0.1.1]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/IMAGINARY/kiosk-browser/compare/v0.0.0...v0.1.0