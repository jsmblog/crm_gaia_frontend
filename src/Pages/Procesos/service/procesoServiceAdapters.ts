import type { InteraccionesService } from "../../../Hooks/Useinteracciones";
import { procesoService } from "../../../Services/procesoService";

export const levantamientoService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesLevantamiento(id),
  crear:    (id, p) => procesoService.crearInteraccionLevantamiento(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionLevantamiento(id, intId),
};

export const estimacionService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesEstimacion(id),
  crear:    (id, p) => procesoService.crearInteraccionEstimacion(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionEstimacion(id, intId),
};

export const propuestaService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesPropuesta(id),
  crear:    (id, p) => procesoService.crearInteraccionPropuesta(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionPropuesta(id, intId),
};

export const aprobacionService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesAprobacion(id),
  crear:    (id, p) => procesoService.crearInteraccionAprobacion(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionAprobacion(id, intId),
};

export const aprobadoService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesAprobado(id),
  crear:    (id, p) => procesoService.crearInteraccionAprobado(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionAprobado(id, intId),
};

export const ejecucionService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesEjecucion(id),
  crear:    (id, p) => procesoService.crearInteraccionEjecucion(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionEjecucion(id, intId),
};

export const cierreService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesCierre(id),
  crear:    (id, p) => procesoService.crearInteraccionCierre(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionCierre(id, intId),
};

export const facturadoService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesFacturado(id),
  crear:    (id, p) => procesoService.crearInteraccionFacturado(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionFacturado(id, intId),
};

export const rechazadoService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesRechazado(id),
  crear:    (id, p) => procesoService.crearInteraccionRechazado(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionRechazado(id, intId),
};

export const standByService: InteraccionesService = {
  listar:   (id) => procesoService.listarInteraccionesStandBy(id),
  crear:    (id, p) => procesoService.crearInteraccionStandBy(id, p),
  eliminar: (id, intId) => procesoService.eliminarInteraccionStandBy(id, intId),
};