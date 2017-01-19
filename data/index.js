const CanonCameras = require('./canon/cameras.json')
const CanonLenses = require('./canon/lenses.json')

const Canon = {
  name: 'Canon',
  url: 'http://global.canon',
  products: {
    lenses: CanonLenses,
    cameras: CanonCameras,
  }
}

const NikonCameras = require('./nikon/cameras.json')
const NikonLenses = require('./nikon/lenses.json')

const Nikon = {
  name: 'Nikon',
  url: 'http://nikon.com',
  products: {
    lenses: NikonLenses,
    cameras: NikonCameras,
  }
}

const OlympusCameras = require('./olympus/cameras.json')
const OlympusLenses = require('./olympus/lenses.json')

const Olympus = {
  name: 'Olympus',
  url: 'http://www.olympus-global.com/',
  products: {
    lenses: OlympusLenses,
    cameras: OlympusCameras,
  }
}

const PentaxCameras = require('./pentax/cameras.json')
const PentaxLenses = require('./pentax/lenses.json')

const Pentax = {
  name: 'Pentax',
  url: 'http://pentax.com.au',
  products: {
    lenses: PentaxLenses,
    cameras: PentaxCameras,
  }
}

const SonyCameras = require('./sony/cameras.json')
const SonyLenses = require('./sony/lenses.json')

const Sony = {
  name: 'Sony',
  url: 'http://sony.com',
  products: {
    lenses: SonyLenses,
    cameras: SonyCameras,
  }
}

const ZeissLenses = require('./zeiss/lenses.json')

const Zeiss = {
  name: 'Zeiss',
  url: 'https://www.zeiss.com/',
  products: {
    lenses: ZeissLenses,
  }
}

const TamronLenses = require('./tamron/lenses.json')

const Tamron = {
  name: 'Tamron',
  url: 'http://tamron-usa.com',
  products: {
    lenses: TamronLenses,
  }
}

const brands = { Canon, Nikon, Olympus, Pentax, Sony, Zeiss, Tamron }

module.exports = { brands }
