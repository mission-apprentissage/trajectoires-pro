import Boom from "boom";

export function ErrorWidgetNotFound() {}
ErrorWidgetNotFound.prototype = Boom.notFound("Widget inconnu");

export function ErrorWidgetInvalidData() {}
ErrorWidgetInvalidData.prototype = Boom.badRequest("Données du widget invalide");

export function ErrorWidgetDoesNotExist() {}
ErrorWidgetDoesNotExist.prototype = Boom.notFound("Ce widget n'existe pas");
