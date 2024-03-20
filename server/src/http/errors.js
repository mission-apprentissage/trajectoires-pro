import Boom from "boom";

function formatBoomErrorData(data) {
  return {
    public: {
      ...data,
    },
  };
}

export function ErrorNoDataForMillesime(millesime, millesimesAvailable) {
  this.data = formatBoomErrorData({ millesime: millesime, millesimesDisponible: millesimesAvailable });
}
ErrorNoDataForMillesime.prototype = Boom.notFound(`Pas de données pour le millésime`);
ErrorNoDataForMillesime.prototype.name = "ErrorNoDataForMillesime";

export function ErrorCertificationNotFound() {}
ErrorCertificationNotFound.prototype = Boom.notFound("Certification inconnue");
ErrorCertificationNotFound.prototype.name = "ErrorCertificationNotFound";

export function ErrorCertificationsNotFound() {}
ErrorCertificationsNotFound.prototype = Boom.notFound("Certifications inconnues");
ErrorCertificationsNotFound.prototype.name = "ErrorCertificationsNotFound";

export function ErrorFormationNotFound() {}
ErrorFormationNotFound.prototype = Boom.notFound("Formation inconnue");
ErrorFormationNotFound.prototype.name = "ErrorFormationNotFound";

export function ErrorFormationNotExist() {}
ErrorFormationNotExist.prototype = Boom.notFound("Formation inconnue");
ErrorFormationNotExist.prototype.name = "ErrorFormationNotExist";

export function ErrorEtablissementNotExist() {}
ErrorEtablissementNotExist.prototype = Boom.notFound("Etablissement inconnu");
ErrorEtablissementNotExist.prototype.name = "ErrorEtablissementNotExist";

export function ErrorRegionaleNotFound() {}
ErrorRegionaleNotFound.prototype = Boom.notFound("Pas de données disponibles");
ErrorRegionaleNotFound.prototype.name = "ErrorRegionaleNotFound";

export function ErrorNoDataAvailable() {}
ErrorNoDataAvailable.prototype = Boom.notFound("Données non disponibles");
ErrorNoDataAvailable.prototype.name = "ErrorNoDataAvailable";

export function ErrorNotAuthorized() {}
ErrorNotAuthorized.prototype = Boom.unauthorized("Not authorized");
ErrorNotAuthorized.prototype.name = "ErrorNotAuthorized";

export function ErrorWrongCredentials() {}
ErrorWrongCredentials.prototype = Boom.unauthorized("Votre nom d'utilisateur ou votre mot de passe est invalide");
ErrorWrongCredentials.prototype.name = "ErrorWrongCredentials";
