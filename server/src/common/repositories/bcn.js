import { MongoRepository } from "./base.js";
import { dbCollection } from "#src/common/db/mongodb.js";
import { name } from "#src/common/db/collections/bcn.js";
import { castArray } from "lodash-es";

export class BCNRepository extends MongoRepository {
  constructor() {
    super(name);
  }

  async exist({ code_certification }) {
    return (await this.first({ code_certification })) ? true : false;
  }

  async first({ code_certification, ...rest }) {
    const query = this.prepare({ code_certification, ...rest });
    return dbCollection(this.getCollection()).find(query).limit(1).next();
  }

  async findCodesFormationDiplome(codeCertification) {
    const found = await dbCollection(this.getCollection())
      .find({ code_certification: { $in: castArray(codeCertification) } })
      .toArray();
    return found.map((f) => f.code_formation_diplome);
  }

  async findAndPaginate({ code_formation_diplome }, options = { page: 1, limit: 10 }) {
    const query = this.prepare({ code_formation_diplome });
    return await this._findAndPaginate(query, {
      ...options,
    });
  }

  async diplomeChildrenGraph({ code_certification }) {
    const query = this.prepare({ code_certification });
    const result = await dbCollection(this.getCollection())
      .aggregate([
        {
          $match: query,
        },
        {
          $graphLookup: {
            from: name,
            startWith: "$nouveau_diplome",
            connectFromField: "nouveau_diplome",
            connectToField: "code_certification",
            as: "childs",
            depthField: "depth",
          },
        },
      ])
      .limit(1)
      .next();

    const graph = result.childs.reduce((acc, child) => {
      if (!acc[child.depth]) {
        acc[child.depth] = [];
      }
      acc[child.depth].push(child);

      return acc;
    }, []);

    return graph;
  }

  async cfdsParentAndChildren(cfd) {
    const cfds = [cfd];

    let diplomeBCNBase = await this.first({ code_certification: cfd });
    if (!diplomeBCNBase) {
      return cfds;
    }

    let diplomeBCN = diplomeBCNBase;
    let parents = diplomeBCN.ancien_diplome;
    // Support only 1 to 1 case
    while (parents && parents.length == 1) {
      cfds.push(parents[0]);
      diplomeBCN = await this.first({ code_certification: parents[0] });
      parents = diplomeBCN?.ancien_diplome;
    }

    diplomeBCN = diplomeBCNBase;
    let children = diplomeBCN.nouveau_diplome;
    // Support only 1 to 1 case
    while (children && children.length == 1) {
      cfds.push(children[0]);
      diplomeBCN = await this.first({ code_certification: children[0] });
      children = diplomeBCN?.nouveau_diplome;
    }

    return cfds;
  }
}

export default new BCNRepository();
