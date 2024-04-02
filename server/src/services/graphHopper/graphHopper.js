import * as turf from "@turf/turf";
import { RateLimitedApi } from "#src/common/api/RateLimitedApi.js";
import config from "#src/config.js";
import { fetchJsonWithRetry } from "#src/common/utils/httpUtils.js";
import geotoolbox from "../../../node_modules/geotoolbox/dist/index.min.js";
// import fs from "fs";
// import { getDirname } from "#src/common/utils/esmUtils.js";

class GraphHopperApi extends RateLimitedApi {
  constructor(options = {}) {
    super("GraphHopperApi", { nbRequests: 5, durationInSeconds: 1, ...options });

    // Disable retry by default
    this.retry = options.retry || { retries: 0 };
  }

  static get baseApiUrl() {
    return config.graphHopper.api.baseUrl;
  }

  async fetchIsochrone({
    point, // "latitude,longitude"
    profile = "pt",
    departureTime = new Date(),
    timeLimit = 1800,
    buckets = 1,
    result = "multipolygon",
  }) {
    return this.execute(async () => {
      const params = new URLSearchParams({
        point,
        profile,
        "pt.earliest_departure_time": departureTime.toISOString(),
        time_limit: timeLimit,
        buckets,
        result,
      });
      console.error(`${GraphHopperApi.baseApiUrl}/isochrone?${params}`);
      const response = await fetchJsonWithRetry(
        `${GraphHopperApi.baseApiUrl}/isochrone?${params}`,
        {},
        { ...this.retry }
      );

      return response;
    });
  }

  buffer(geometry, distance = 0.1) {
    const buffered = turf.buffer(geometry, distance, { units: "kilometers" });
    return buffered;
  }

  async fetchIsochronePTBuckets({ point, departureTime = new Date(), buckets = [1800] }) {
    // GraphHopper does not support buckets for public transportation
    // We request the isochrone API with different duration

    //const timePart = timeLimit / buckets;

    const times = buckets.sort((a, b) => b - a);
    //  new Array(buckets)
    //   .fill(0)
    //   .map((v, index) => (index + 1) * timePart)
    //   .reverse();
    const geometries = [];
    for (const time of times) {
      // if (time === 3600) {
      //   const geometry = JSON.parse(fs.readFileSync(getDirname(import.meta.url) + "/a.json"));
      //   geometries.push({
      //     time,
      //     feature: geometry.polygons[0],
      //   });
      // }

      // if (time === 1800) {
      //   const geometry = JSON.parse(fs.readFileSync(getDirname(import.meta.url) + "/b.json"));
      //   geometries.push({
      //     time,
      //     feature: geometry.polygons[0],
      //   });
      // }
      const geometry = await this.fetchIsochrone({ point, departureTime, timeLimit: time });
      geometries.push({
        time,
        feature: geometry.polygons[0],
      });
    }

    const tStart = Date.now();

    let geometriesBuffer = await Promise.all(
      geometries.map(async (value) => {
        // Buffer the result with 100 meters and simplify (remove hole in the polygon)

        return {
          ...value,
          //feature: turf.simplify(value.feature, options),
          //feature: this.buffer(value.feature),
          // feature: await geotoolbox.union(
          //   await geotoolbox.buffer(value.feature, { dist: 0.1, quadsegs: 2, merge: true })
          // ),
          feature: await geotoolbox.buffer(value.feature, { dist: 0.1, quadsegs: 2, merge: true }),
        };
      })
    );

    // geometriesBuffer = await Promise.all(
    //   geometriesBuffer.map(async (value, index) => {
    //     if (!geometriesBuffer[index + 1]) {
    //       return value;
    //     }

    //     return {
    //       ...value,
    //       feature: await geotoolbox.clip(value.feature, {
    //         buffer: 0,
    //         reverse: true,
    //         clip: geometriesBuffer[index + 1].feature,
    //       }),
    //     };
    //   })
    // );

    const geometriesDiff = geometriesBuffer.map((value) => {
      //convert featureCollection (not support in geo query in mongodb) to geometryCollection
      return {
        ...value,
        feature: turf.geometryCollection(
          turf.featureReduce(
            value.feature,
            (acc, feature) => {
              if (feature.geometry.type === "GeometryCollection") {
                acc.push(...feature.geometry.geometries);
                return acc;
              }

              acc.push(feature.geometry);
              return acc;
            },
            []
          )
        ),
      };
    });

    console.error("COMPUTE", Date.now() - tStart);

    return geometriesDiff;
  }
}

export { GraphHopperApi };
