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

export function ErrorCertificationNotFound() {}
ErrorCertificationNotFound.prototype = Boom.notFound("Certification inconnue");

export function ErrorCertificationsNotFound() {}
ErrorCertificationsNotFound.prototype = Boom.notFound("Certifications inconnues");

export function ErrorFormationNotFound() {}
ErrorFormationNotFound.prototype = Boom.notFound("Formation inconnue");

export function ErrorRegionaleNotFound() {}
ErrorRegionaleNotFound.prototype = Boom.notFound("Pas de données disponibles");

export function ErrorNoDataAvailable() {}
ErrorNoDataAvailable.prototype = Boom.notFound("Données non disponibles");

export function ErrorNotAuthorized() {}
ErrorNotAuthorized.prototype = Boom.unauthorized("Not authorized");

export function ErrorWrongCredentials() {}
ErrorWrongCredentials.prototype = Boom.unauthorized("Votre nom d'utilisateur ou votre mot de passe est invalide");
