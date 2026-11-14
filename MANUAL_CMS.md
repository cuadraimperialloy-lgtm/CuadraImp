# MANUAL DE USO DEL CMS ADMINISTRATIVO (`/admin`) — Cuadra Imperial Loy

El panel administrativo de **Cuadra Imperial Loy** se encuentra en la ruta `/admin` (oculta de buscadores con `noindex` y excluida del `sitemap.xml`). Permite gestionar ejemplares, leads de WhatsApp, citas privadas, horario de atención y cumplimiento de privacidad LFPDPPP desde computadora o celular.

---

## 1. Roles y permisos

| Acción | Rol **Administrador** | Rol **Ventas** |
|---|---|---|
| Ver y editar leads / copiar guion de WhatsApp | Sí | Sí |
| Cambiar estado de un caballo (Disponible, Apartado, Vendido) | Sí | Sí |
| Dar de alta, editar o archivar caballos | Sí | Sí |
| **Borrar definitivamente** un caballo (escribiendo su nombre) | **Sí** | **No** |
| **Exportar leads a CSV** | **Sí** | **No** |
| Modificar **Ajustes globales** (horario, número oficial) | **Sí** | **No** |
| Ver Bitácora de auditoría | Sí | Sí |

---

## 2. Cómo atender un lead que llega por WhatsApp (Flujo por Folio)

1. Cada vez que un cliente hace clic en un botón de WhatsApp en el sitio, el sistema registra el lead y agrega al final de su mensaje un código único, por ejemplo:
   `Ref: CIL-4F7K · Ficha · YDE`
2. Abra `/admin` y vaya a la pestaña **Leads**.
3. Escriba el folio (`CIL-4F7K`) en el **Buscador por folio**.
4. Haga clic en **Ficha y Guion**:
   - Complete el nombre y número de WhatsApp del cliente si hizo clic rápido.
   - En el bloque **Guion de respuesta WhatsApp**, verá las 6 respuestas oficiales ya rellenadas con el nombre del caballo y su **precio interno privado** (`$820,000 – $940,000 MXN`).
   - Presione **Copiar respuesta** y péguela en su chat de WhatsApp.
5. Cambie la etapa del lead conforme avance:
   `Nuevo` → `Contactado` → `Cita agendada` → `Visitó` → `Apartado` → `Vendido` / `Perdido` (si marca *Perdido*, el sistema le pedirá el motivo: precio, ya compró, no respondió u otro).

---

## 3. Gestión de caballos (Alta, edición y baja)

1. En la pestaña **Caballos**, use las flechas de la columna **Orden** para definir el orden de *"Selección de la cuadra"* en la página principal y el catálogo.
2. Haga clic en **Editar** sobre cualquier ejemplar:
   - **Edad automática:** Solo capture la `Fecha de nacimiento`; el sitio calcula la edad exacta en tiempo real.
   - **Nivel de doma manual:** Seleccione manualmente (*Potro, Iniciando rienda, Con rienda, Alta escuela* o *Sin especificar*). Nunca se asigna por edad.
   - **Premios controlados:** Marque únicamente los predicados oficiales de la lista controlada (*1er premio, Ster, Kroon, Sport*, etc.).
   - **Precio interno privado:** Capture el precio en MXN y USD. **Este dato nunca se envía al sitio web público**; solo sirve para su control interno y para llenar el guion de WhatsApp.
   - **Documentos privados:** Genere un **enlace temporal firmado (7 días)** del pasaporte o genealogía para compartirlo por WhatsApp.
3. **Al marcar un caballo como Vendido:**
   - Su ficha pública oculta automáticamente los botones de compra/cita y muestra *"Este caballo ya está con su nuevo dueño."*
   - En la bandeja de **Leads**, los clientes abiertos que preguntaron por ese ejemplar se señalan con el aviso *"Ejemplar vendido · ofrecer alternativa"*.

---

## 4. Privacidad y Derechos ARCO (LFPDPPP)

Si un cliente solicita la cancelación o eliminación de sus datos personales:
1. Busque su registro en **Leads** → **Ficha y Guion**.
2. Haga clic en **Eliminar datos (ARCO)** en la parte inferior.
3. El sistema anonimiza de inmediato su nombre, teléfono, ciudad e IP, conservando únicamente el folio estadístico y dejando constancia en la **Bitácora de cambios**.

