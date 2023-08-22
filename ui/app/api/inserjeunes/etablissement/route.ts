import { NextResponse } from "next/server";
import * as CA from "#/services/catalogueApprentissage/index";
import { cacheWithObjectArgument } from "#/common/cache";
import { etablissementSchema, pageSchema } from "#/services/catalogueApprentissage/validators";

import { getServerSession } from "next-auth/next";
import { authOptions } from "#/app/api/inserjeunes/auth/[...nextauth]/route";
import { UserSession, Etablissement } from "#/services/inserjeunes/types";
import * as CATypes from "#/services/catalogueApprentissage/types";

const apiCached = cacheWithObjectArgument(CA.etablissements);

export async function GET() {
  const session = await getServerSession(authOptions);
  //TODO : check session with middleware
  if (!session) {
    return NextResponse.error();
  }

  const user = session.user as unknown as UserSession;
  const searchParams = { uai: user.uai, siret: user.siret };

  const params = await etablissementSchema.validate(searchParams, {
    stripUnknown: true,
  });
  const page = await pageSchema.validate(searchParams, { stripUnknown: true });
  const etablissements: CATypes.Paginations<"etablissements", CATypes.Etablissement[]> = await apiCached(params, page);

  //TODO : fetch etablissement stat
  const etablissementStats = {
    taux_en_emploi_6_mois: 18,
    taux_en_emploi_6_mois_regional: 14,
    diff_taux_6_mois_regional: 4,
  };

  return NextResponse.json({
    etablissement: etablissements.etablissements[0],
    stats: etablissementStats,
  } as Etablissement<CATypes.Etablissement>);
}
