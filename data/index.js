const CanonCameras = require('./canon/cameras.json')
const CanonLenses = require('./canon/lenses.json')

const Canon = {
  name: 'Canon',
  products: {
    lenses: CanonLenses,
    cameras: CanonCameras,
  }
}

const NikonCameras = require('./nikon/cameras.json')
const NikonLenses = require('./nikon/lenses.json')

const Nikon = {
  name: 'Nikon',
  products: {
    lenses: NikonLenses,
    cameras: NikonCameras,
  }
}

const OlympusCameras = require('./olympus/cameras.json')
const OlympusLenses = require('./olympus/lenses.json')

const Olympus = {
  name: 'Olympus',
  products: {
    lenses: OlympusLenses,
    cameras: OlympusCameras,
  }
}

const PentaxCameras = require('./pentax/cameras.json')
const PentaxLenses = require('./pentax/lenses.json')

const Pentax = {
  name: 'Pentax',
  products: {
    lenses: PentaxLenses,
    cameras: PentaxCameras,
  }
}

const SonyCameras = require('./sony/cameras.json')
const SonyLenses = require('./sony/lenses.json')

const Sony = {
  name: 'Sony',
  products: {
    lenses: SonyLenses,
    cameras: SonyCameras,
  }
}

const ZeissLenses = require('./zeiss/lenses.json')

const Zeiss = {
  name: 'Zeiss',
  products: {
    lenses: ZeissLenses,
  }
}

const TamronLenses = require('./tamron/lenses.json')

const Tamron = {
  name: 'Tamron',
  products: {
    lenses: TamronLenses,
  }
}

const brands = { Canon, Nikon, Olympus, Pentax, Sony, Zeiss, Tamron }

module.exports = { brands }
