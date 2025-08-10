import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import userService from '../../services/userService';

/**
 * Formulario inline para crear/editar usuarios (sin modal)
 * Simplificado y orientado al flujo dual Web/Móvil
 */
const getGroupName = (g) => g?.nombre || g?.name || '';

const UserFormInline = ({
  mode = 'create',
  initialData = null,
  groups = [],
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const isEdit = mode === 'edit';

  // Derivar grupos por tipo
  const webGroups = useMemo(
    () => groups.filter((g) => getGroupName(g).endsWith('_Web')),
    [groups]
  );
  const movilGroup = useMemo(
    () => groups.find((g) => getGroupName(g).endsWith('_Movil') || /movil/i.test(getGroupName(g))),
    [groups]
  );

  // Estado del tab activo
  const [activeTab, setActiveTab] = useState('datos'); // 'datos' | 'accesos'

  // Estado del formulario
  const [form, setForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    is_active: true,
    acceso_web_activo: false,
    acceso_movil_activo: true,
    web_group_id: '',
    assign_movil: true,
  });

  // Estado para consulta DNI
  const [dniLoading, setDniLoading] = useState(false);
  const [dniMessage, setDniMessage] = useState('');
  const dniTimerRef = useRef(null);

  // Cargar datos al editar
  useEffect(() => {
    if (initialData) {
      const assignedGroupIds = (initialData.grupos_asignados || initialData.groups || []).map((g) => g.id);
      const currentWebGroup = (initialData.grupos_asignados || initialData.groups || []).find((g) =>
        getGroupName(g).endsWith('_Web')
      );
      const hasMovil = (initialData.grupos_asignados || initialData.groups || []).some((g) =>
        getGroupName(g).endsWith('_Movil') || /movil/i.test(getGroupName(g))
      );

      setForm((prev) => ({
        ...prev,
        username: initialData.username || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        email: initialData.email || '',
        is_active: Boolean(initialData.is_active),
        acceso_web_activo: Boolean(initialData.acceso_web_activo || Boolean(currentWebGroup)),
        acceso_movil_activo: Boolean(initialData.acceso_movil_activo || hasMovil),
        web_group_id: currentWebGroup?.id || '',
        assign_movil: hasMovil,
      }));
    }
  }, [initialData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleToggle = useCallback((name) => {
    setForm((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones mínimas
    if (!form.username?.trim()) {
      alert('El DNI (username) es obligatorio');
      setActiveTab('datos');
      return;
    }

    if (!isEdit && form.password && form.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      setActiveTab('datos');
      return;
    }

    if (form.password && form.password !== form.confirm_password) {
      alert('Las contraseñas no coinciden');
      setActiveTab('datos');
      return;
    }

    if (form.acceso_web_activo && !form.web_group_id) {
      alert('Selecciona un Perfil Web');
      setActiveTab('accesos');
      return;
    }

    // Construir payload
    const groups_ids = [];
    if (form.acceso_web_activo && form.web_group_id) groups_ids.push(Number(form.web_group_id));
    if (form.acceso_movil_activo && movilGroup?.id && form.assign_movil) groups_ids.push(Number(movilGroup.id));

    const payload = {
      username: form.username?.trim(),
      first_name: form.first_name?.trim(),
      last_name: form.last_name?.trim(),
      email: form.email?.trim() || '',
      password: form.password || undefined,
      confirm_password: form.password ? form.confirm_password : undefined,
      is_active: form.is_active,
      acceso_web_activo: form.acceso_web_activo,
      acceso_movil_activo: form.acceso_movil_activo,
      groups_ids,
    };

    // Limpieza de undefined
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    await onSubmit?.(payload);
  };

  // Función para consultar DNI y autocompletar nombres
  const consultarDni = useCallback(async (dni) => {
    if (!dni || !/^\d{8}$/.test(dni)) return;
    try {
      setDniLoading(true);
      setDniMessage('Consultando DNI...');
      const resp = await userService.utils.consultarDni(dni);
      const data = resp?.data || resp;
      const nombres = data?.nombres || '';
      const apPat = data?.apellido_paterno || '';
      const apMat = data?.apellido_materno || '';
      setForm((prev) => ({
        ...prev,
        first_name: nombres || prev.first_name,
        last_name: (apPat || apMat) ? `${apPat} ${apMat}`.trim() : prev.last_name,
      }));
      setDniMessage('Datos cargados');
      setTimeout(() => setDniMessage(''), 1500);
    } catch (err) {
      setDniMessage('No se pudo consultar el DNI');
      setTimeout(() => setDniMessage(''), 2000);
    } finally {
      setDniLoading(false);
    }
  }, []);

  // Debounce: consultar DNI cuando el username tenga 8 dígitos
  useEffect(() => {
    if (dniTimerRef.current) {
      clearTimeout(dniTimerRef.current);
    }
    if (/^\d{8}$/.test(form.username)) {
      dniTimerRef.current = setTimeout(() => consultarDni(form.username), 500);
    }
    return () => {
      if (dniTimerRef.current) clearTimeout(dniTimerRef.current);
    };
  }, [form.username, consultarDni]);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 mb-6">
      <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {isEdit ? 'Editar Usuario' : 'Crear Usuario'}
          </h2>
          <p className="text-xs text-slate-500">Datos y accesos en dos pestañas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            form="user-inline-form"
            disabled={loading}
            className="px-3 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a12 12 0 00-12 12h4z"></path>
              </svg>
            )}
            {isEdit ? 'Guardar' : 'Crear'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-6 border-b border-slate-200 bg-white/60">
        <nav className="flex gap-6" aria-label="Tabs">
          {['datos', 'accesos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-medium border-b-2 -mb-px ${
                activeTab === tab ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'datos' ? 'Datos' : 'Accesos'}
            </button>
          ))}
        </nav>
      </div>

      <form id="user-inline-form" onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        {activeTab === 'datos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700">DNI (Usuario) *</label>
              <div className="mt-1 flex gap-2">
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <button
                  type="button"
                  onClick={() => consultarDni(form.username)}
                  disabled={dniLoading || !/^\d{8}$/.test(form.username)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {dniLoading ? 'Consultando...' : 'Consultar'}
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[11px] text-slate-500">Se usa como usuario para iniciar sesión</p>
                {dniMessage && <span className="text-[11px] text-slate-600">{dniMessage}</span>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Nombres *</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Apellidos *</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
            </div>

            {!isEdit && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Contraseña *</label>
                  <input name="password" type="password" value={form.password} onChange={handleChange} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Confirmar Contraseña *</label>
                  <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                </div>
              </>
            )}

            <div className="col-span-1 md:col-span-2 flex items-center gap-6 mt-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={() => handleToggle('is_active')} />
                Usuario Activo
              </label>
            </div>
          </div>
        )}

        {activeTab === 'accesos' && (
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <div>
                <div className="text-sm font-medium text-slate-900">Acceso Móvil</div>
                <div className="text-xs text-slate-500">
                  Permite iniciar sesión en la app móvil {movilGroup ? `(grupo: ${getGroupName(movilGroup)})` : ''}
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.acceso_movil_activo} onChange={() => handleToggle('acceso_movil_activo')} />
                Habilitado
              </label>
            </div>

            {form.acceso_movil_activo && movilGroup && (
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.assign_movil} onChange={() => handleToggle('assign_movil')} />
                Asignar grupo móvil automático ({getGroupName(movilGroup)})
              </label>
            )}

            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50/50">
              <div>
                <div className="text-sm font-medium text-slate-900">Acceso Web</div>
                <div className="text-xs text-slate-500">Selecciona el perfil web del Panel</div>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.acceso_web_activo} onChange={() => handleToggle('acceso_web_activo')} />
                Habilitado
              </label>
            </div>

            {form.acceso_web_activo && (
              <div>
                <label className="block text-xs font-medium text-slate-700">Perfil Web</label>
                <select
                  name="web_group_id"
                  value={form.web_group_id}
                  onChange={handleChange}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">Seleccionar perfil web</option>
                  {webGroups.map((g) => (
                    <option key={g.id} value={g.id}>{getGroupName(g)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default UserFormInline;

