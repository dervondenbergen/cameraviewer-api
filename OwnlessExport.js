const moment = require("moment");

let j = json => {
  return JSON.stringify(json);
};

module.exports = knex => {
  let findGroup = specs => {
    return name => specs.find(spec => spec.group === name);
  };

  let findFact = group => {
    return name => {
      let fact = group.facts.find(fact => fact.label === name);
      if (fact) {
        return fact.value;
      } else {
        return null;
      }
    };
  };

  let getCameraSpecs = specs => {
    let extraSpecs = {};

    let fG = findGroup(specs);

    // Body type
    let body_type = null;
    let bodyGroup = fG("Body type");
    if (bodyGroup && ~bodyGroup.facts.length) {
      body_type = findFact(bodyGroup)("Body type");
    }
    extraSpecs.body_type = body_type;

    // Sensor
    let max_resolution = null;
    let effective_pixels = null;
    let sensor_size = null;
    let sensorGroup = fG("Sensor");
    if (sensorGroup && ~sensorGroup.facts.length) {
      let fF = findFact(sensorGroup);

      max_resolution = fF("Max resolution");
      effective_pixels = fF("Effective pixels");
      sensor_size = fF("Sensor size");
    }
    extraSpecs.max_resolution = max_resolution;
    extraSpecs.effective_pixels = effective_pixels;
    extraSpecs.sensor_size = sensor_size;

    // Image
    let iso_min = null;
    let iso_max = null;
    let imageGroup = fG("Image");
    if (imageGroup && ~imageGroup.facts.length) {
      let fF = findFact(imageGroup);

      let iso_range = fF("ISO");

      if (iso_range !== null) {
        // 80-3200
        let isoRegex = /(\d+)-(\d+)/;
        let isoMatch;

        if ((isoMatch = isoRegex.exec(iso_range)) !== null) {
          iso_min = isoMatch[1];
          iso_max = isoMatch[2];
        }

        // Auto, 80, 100, 200
        let isoArray = iso_range.split(",").map(p => p.trim());
        let isoList = [];
        if (isoArray[0] === "Auto") {
          isoArray.shift();
          isoArray.forEach(iso => {
            if (iso === String(Number(iso))) {
              isoList.push(iso);
            }
          });

          let min = isoList[0];
          let max = isoList[isoList.length - 1];

          if (min < iso_min || iso_min === null) iso_min = min;
          if (max > iso_max || iso_max === null) iso_max = max;
        }
      }

      // Boosted
      boostedMin = fF("Boosted ISO (minimum)");
      if ((boostedMin !== null && boostedMin < iso_min) || iso_min === null) {
        iso_min = boostedMin;
      }
      boostedMax = fF("Boosted ISO (maximum)");
      if ((boostedMax !== null && boostedMax > iso_max) || iso_max === null) {
        iso_max = boostedMax;
      }

      if (iso_min !== null) {
        iso_min = Number(iso_min);
      }
      if (iso_max !== null) {
        iso_max = Number(iso_max);
      }
    }
    extraSpecs.iso_min = iso_min;
    extraSpecs.iso_max = iso_max;

    // Optics & Focus
    let lens_mount = null;
    let opticsGroup = fG("Optics & Focus");
    if (opticsGroup && ~opticsGroup.facts.length) {
      lens_mount = findFact(opticsGroup)("Lens mount");
    }
    extraSpecs.lens_mount = lens_mount;

    // Optics & Focus
    let viewfinder_type = null;
    let viewfinder_coverage = null;
    let viewfinderGroup = fG("Screen / viewfinder");
    if (viewfinderGroup && ~viewfinderGroup.facts.length) {
      let fF = findFact(viewfinderGroup);

      viewfinder_type = fF("Viewfinder type");
      viewfinder_coverage = fF("Viewfinder coverage");
    }
    extraSpecs.viewfinder_type = viewfinder_type;
    extraSpecs.viewfinder_coverage = viewfinder_coverage;

    // Photography features
    let max_shutter_speed = null;
    let photographyGroup = fG("Photography features");
    if (photographyGroup && ~photographyGroup.facts.length) {
      max_shutter_speed = findFact(photographyGroup)("Maximum shutter speed");
    }
    extraSpecs.max_shutter_speed = max_shutter_speed;

    // Storage types
    let storage_types = null;
    let storageGroup = fG("Storage");
    if (storageGroup && ~storageGroup.facts.length) {
      storage_types = findFact(storageGroup)("Storage types");
    }
    extraSpecs.storage_types = storage_types;

    // Physical
    let dimensions = null;
    let weight = null;
    let physicalGroup = fG("Physical");
    if (physicalGroup && ~physicalGroup.facts.length) {
      let fF = findFact(physicalGroup);

      dimensions = fF("Dimensions");
      weight = fF("Weight (inc. batteries)");
    }
    extraSpecs.dimensions = dimensions;
    extraSpecs.weight = weight;

    // Storage types
    let gps = null;
    let otherGroup = fG("Other features");
    if (otherGroup && ~otherGroup.facts.length) {
      gps = findFact(otherGroup)("GPS");
    }
    extraSpecs.gps = gps;

    return extraSpecs;
  };

  let getLensSpecs = specs => {
    var extraSpecs = {};

    let fG = findGroup(specs);

    // Principal specifications
    let type = null;
    let focal_length = null;
    let min_focal_length = null;
    let max_focal_length = null;
    let lens_mount = null;
    let format_size = null;
    let principalGroup = fG("Principal specifications");
    if (principalGroup && ~principalGroup.facts.length) {
      let fF = findFact(principalGroup);

      // Lens
      type = fF("Lens type");
      if (type !== null) {
        type = type.replace("lens", "").trim().toLowerCase();
      }

      // Focal length
      focal_length = fF("Focal length");
      if (focal_length !== null) {
        let min_max = focal_length.replace("mm", "").trim().split("–");
        if (~min_max.length) {
          min_focal_length = Number(min_max[0]);
          max_focal_length = Number(min_max[min_max.length - 1]);
        }
      }

      // Lens mount
      lens_mount = fF("Lens mount");

      // Max Format size
      format_size = fF("Max Format size");
    }
    extraSpecs.type = type;
    extraSpecs.focal_length = focal_length;
    extraSpecs.min_focal_length = min_focal_length;
    extraSpecs.max_focal_length = max_focal_length;
    extraSpecs.lens_mount = lens_mount;
    extraSpecs.format_size = format_size;

    // Aperture
    let min_aperture = null;
    let max_aperture = null;
    let apertureGroup = fG("Aperture");
    if (apertureGroup && ~apertureGroup.facts.length) {
      let fF = findFact(apertureGroup);

      min_aperture = fF("Minimum aperture");
      max_aperture = fF("Maximum aperture");
    }
    extraSpecs.min_aperture = min_aperture;
    extraSpecs.max_aperture = max_aperture;

    // Focus
    let autofocus = null;
    let focusGroup = fG("Focus");
    if (focusGroup && ~focusGroup.facts.length) {
      autofocus = findFact(focusGroup)("Autofocus");
      if (autofocus === "Yes") autofocus = true;
      if (autofocus === "No") autofocus = false;
    }
    extraSpecs.autofocus = autofocus;

    // Physical
    let weight = null;
    let length = null;
    let filter_thread = null;
    let sealing = null;
    let physicalGroup = fG("Physical");
    if (physicalGroup && ~physicalGroup.facts.length) {
      let fF = findFact(physicalGroup);

      weight = fF("Weight");
      length = fF("Length");
      filter_thread = fF("Filter thread");
      sealing = fF("Sealing");
      if (sealing === "Yes") sealing = true;
      if (sealing === "No") sealing = false;
    }
    extraSpecs.weight = weight;
    extraSpecs.length = length;
    extraSpecs.filter_thread = filter_thread;
    extraSpecs.sealing = sealing;

    return extraSpecs;
  };

  let OwnlessExport = (req, res, { type }) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    knex
      .select([
        "product.id",
        "product.name",
        "brand.name as brand",
        "product.short_specs",
        "product.specs",
        "product.release_date",
        "product.price"
      ])
      .from("product")
      .innerJoin("brand", "product.brand", "=", "brand.id")
      .where({ type: type })
      .then(products => {
        let infos = products.map(product => {
          let specs = product.specs;
          let info = {};

          // id
          info.id = product.id;

          // name
          info.name = product.name;

          // brand
          info.brand = product.brand;

          // price
          let price = null;
          let priceGroup = findGroup(specs)("Price");
          if (priceGroup && ~priceGroup.facts.length) {
            price = findFact(priceGroup)("MSRP");
          } else {
            price = product.price;
          }
          if (price !== null) {
            price = price.replace(/,/g, "");
            let priceRegex = /\$(\d*\.?\d{0,2})/;
            let priceMatch;

            if ((priceMatch = priceRegex.exec(price)) !== null) {
              price = priceMatch[1];
            } else {
              price = null;
            }
          }
          info.price = price;

          // release date
          let release_date = product.release_date;
          if (release_date !== null) {
            release_date = moment(release_date).format("YYYY-MM-DD");
          }
          info.release_date = release_date;

          if (type === "lens") {
            let detailed_type = null;
            let short_specs = product.short_specs.split("|");
            if (~short_specs.length) {
              detailed_type = short_specs[0].trim();
            }
            info.detailed_type = detailed_type;
          }

          // remaining specs
          let remainingSpecs = {};
          switch (type) {
            case "camera":
              remainingSpecs = getCameraSpecs(specs);
              break;
            case "lens":
              remainingSpecs = getLensSpecs(specs);
              break;
          }
          Object.assign(info, remainingSpecs);

          return info;
        });

        res.end(j(infos));
      });
  };

  return OwnlessExport;
};
