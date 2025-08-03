// src/utils/alertasCrud.js
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const alertaCreado = () => {
  return MySwal.fire({
    title: "🎉 ¡Registro creado!",
    text: "✅ La información fue guardada correctamente.",
    icon: "success",
    confirmButtonText: "💾 OK",
  });
};

export const alertaActualizado = () => {
  return MySwal.fire({
    title: "🔄 ¡Registro actualizado!",
    text: "✏️ Los cambios se guardaron con éxito.",
    icon: "success",
    confirmButtonText: "👌 Entendido",
  });
};

export const alertaEliminado = (mensaje = "") => {
  const textoBase = "❌ El elemento fue borrado correctamente.";
  const textoFinal = mensaje
    ? `${textoBase}\n📝 ${mensaje}`
    : textoBase;

  return MySwal.fire({
    title: "🗑️ ¡Registro eliminado!",
    text: textoFinal,
    icon: "success",
    confirmButtonText: "👍 Listo",
  });
};
export const alertaError = (mensaje) => {
  return MySwal.fire({
    title: "⚠️ Algo salió mal",
     text: mensaje || "😓 No pudimos completar la operación. Intenta de nuevo.",
    icon: "error",
    confirmButtonText: "🔁 Reintentar",
  });
};


export const confirmarEliminacion = async () => {
  const result = await MySwal.fire({
    title: "🗑️ ¿Estás seguro?",
    text: "Esta acción eliminará el registro permanentemente.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  return result.isConfirmed;
};

export const alertaDescarga = () => {
  return MySwal.fire({
    title: "📥 ¡Descarga lista!",
    text: "✅ El archivo Excel se ha generado y comenzará a descargarse.",
    icon: "success",
    confirmButtonText: "Entendido",
  });
};