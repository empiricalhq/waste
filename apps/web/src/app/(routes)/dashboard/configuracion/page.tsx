// Se elimina la importación de DashboardLayout ya que no es necesaria.

export default function ConfiguracionPage() {
  return (
    <div>
      {/* Encabezado de la página */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Ajustes del sistema, usuarios y roles.
          </p>
        </div>
        {/* Aquí podrías poner un botón si fuera necesario, como en el ejemplo */}
        {/* <AddUserButton /> */}
      </div>

      {/* Contenido de la página de configuración */}
      <div className="space-y-8">
        {/* Sección de Gestión de Usuarios */}
        <div>
          <h2 className="text-xl font-semibold">Gestión de Usuarios</h2>
          <div className="bg-card text-card-foreground mt-4 rounded-lg border p-4">
            <p>
              Aquí irá la tabla o lista para crear, editar y desactivar
              usuarios.
            </p>
          </div>
        </div>

        {/* Sección de Roles y Permisos */}
        <div>
          <h2 className="text-xl font-semibold">Roles y Permisos</h2>
          <div className="bg-card text-card-foreground mt-4 rounded-lg border p-4">
            <p>
              Aquí irá la interfaz para definir los roles (admin, supervisor) y
              sus permisos.
            </p>
          </div>
        </div>

        {/* Otras configuraciones */}
        <div>
          <h2 className="text-xl font-semibold">Preferencias Generales</h2>
          <div className="bg-card text-card-foreground mt-4 rounded-lg border p-4">
            <p>
              Aquí irán otros ajustes como preferencias de notificación,
              integraciones, etc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
