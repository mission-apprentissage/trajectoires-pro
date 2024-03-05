import Boom from "boom";

export function ErrorWidgetNotFound() {}
ErrorWidgetNotFound.prototype = Boom.notFound("Widget inconnu");
ErrorWidgetNotFound.prototype.name = "ErrorWidgetNotFound";

export function ErrorWidgetInvalidData() {}
ErrorWidgetInvalidData.prototype = Boom.badRequest("Données du widget invalide");
ErrorWidgetInvalidData.prototype.name = "ErrorWidgetInvalidData";

export function ErrorWidgetDoesNotExist() {}
ErrorWidgetDoesNotExist.prototype = Boom.notFound("Ce widget n'existe pas");
ErrorWidgetDoesNotExist.prototype.name = "ErrorWidgetDoesNotExist";
