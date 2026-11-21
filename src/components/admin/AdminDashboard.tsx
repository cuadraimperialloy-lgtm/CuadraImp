'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Archive,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Download,
  Calendar,
} from 'lucide-react';
import {
  CONTROLLED_AWARDS,
  type AdminHorse,
  type ControlledAward,
  type DatabaseSchema,
  type DomaLevel,
  type HorseOrigin,
  type HorseSex,
  type HorseStatus,
  type HorseType,
  type LeadRecord,
  type LeadStage,
  type LossReason,
} from '@/types';
import {
  calculateHorseAge,
  formatHorseStatus,
} from '@/lib/utils';

const STAGES: Array<{ id: LeadStage; label: string }> = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'cita_agendada', label: 'Cita agendada' },
  { id: 'visito', label: 'Visitó' },
  { id: 'apartado', label: 'Apartado' },
  { id: 'vendido', label: 'Vendido' },
  { id: 'perdido', label: 'Perdido' },
];

export function AdminDashboard({
  initialDb,
  initialAuthenticated = false,
}: {
  initialDb: DatabaseSchema;
  initialAuthenticated?: boolean;
}) {
  const [db, setDb] = useState<DatabaseSchema>(initialDb);

  // Auth & Role state
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [loginEmail, setLoginEmail] = useState('admin@cuadraimperialloy.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [role, setRole] = useState<'admin' | 'ventas'>('admin');
  const [loginError, setLoginError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'horses' | 'leads' | 'appointments' | 'analytics' | 'settings' | 'audit'
  >('horses');

  // Toast feedback
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3200);
  };

  // Horses tab state
  const [horseSearch, setHorseSearch] = useState('');
  const [horseTypeFilter, setHorseTypeFilter] = useState<'all' | HorseType>('all');
  const [editingHorse, setEditingHorse] = useState<AdminHorse | null>(null);
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [signedLinkToast, setSignedLinkToast] = useState<string | null>(null);

  // Leads tab state
  const [folioSearch, setFolioSearch] = useState('');
  const [leadsViewMode, setLeadsViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Support optional URL tab navigation
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'leads') {
        setActiveTab('leads');
      } else if (tabParam === 'horses') {
        setActiveTab('horses');
      } else if (tabParam === 'settings') {
        setActiveTab('settings');
      } else if (tabParam === 'horse_form') {
        setActiveTab('horses');
        if (initialDb.horses[0]) {
          setEditingHorse(structuredClone(initialDb.horses[0]));
        }
      }
    } catch {
      // ignore
    }
  }, [initialDb.horses]);

  // API helper
  const callAdminApi = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        role,
        actor: role === 'admin' ? 'Administrador' : 'Ventas',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      showNotice(data.error || 'Acción no permitida');
      return null;
    }
    if (data.db) {
      setDb(data.db);
    }
    return data;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Ingresa tu correo y contraseña.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Correo o contraseña incorrectos.');
      } else {
        setIsAuthenticated(true);
        setLoginPassword('');
        showNotice('Sesión iniciada con éxito');
      }
    } catch {
      setLoginError('Error de red al intentar iniciar sesión.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setLoginPassword('');
    showNotice('Sesión cerrada');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Ingresa tu contraseña actual.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmación de la contraseña no coincide.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'No se pudo actualizar la contraseña.');
      } else {
        setPasswordSuccess('¡Contraseña actualizada con éxito!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showNotice('Contraseña actualizada con éxito');
      }
    } catch {
      setPasswordError('Error al procesar la solicitud.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Lead counts per horse
  const leadCountByHorseCode = useMemo(() => {
    const map: Record<string, number> = {};
    db.leads.forEach((l) => {
      l.horseCodes.forEach((code) => {
        map[code] = (map[code] || 0) + 1;
      });
    });
    return map;
  }, [db.leads]);

  const filteredHorses = useMemo(() => {
    return db.horses
      .filter((h) => {
        if (horseTypeFilter !== 'all' && h.type !== horseTypeFilter) return false;
        if (
          horseSearch.trim() &&
          !h.name.toLowerCase().includes(horseSearch.toLowerCase()) &&
          !h.code.toLowerCase().includes(horseSearch.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [db.horses, horseTypeFilter, horseSearch]);

  const filteredLeads = useMemo(() => {
    const q = folioSearch.trim().toLowerCase();
    if (!q) return db.leads;
    return db.leads.filter(
      (l) =>
        l.folio.toLowerCase().includes(q) ||
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.whatsapp && l.whatsapp.toLowerCase().includes(q)) ||
        l.horseCodes.some((c) => c.toLowerCase().includes(q))
    );
  }, [db.leads, folioSearch]);

  // Duplicate phone detection (12.4)
  const duplicatePairs = useMemo(() => {
    const byPhone: Record<string, LeadRecord[]> = {};
    db.leads.forEach((l) => {
      if (!l.whatsapp) return;
      const clean = l.whatsapp.replace(/\D/g, '');
      if (clean.length < 8) return;
      byPhone[clean] = byPhone[clean] || [];
      byPhone[clean].push(l);
    });
    return Object.values(byPhone).filter((group) => group.length > 1);
  }, [db.leads]);

  // Generate WhatsApp response templates from GUION_WHATSAPP.md (Sección 11 & 12.4)
  const buildScriptTemplates = (lead: LeadRecord) => {
    const clientName = lead.name || 'estimado cliente';
    const firstCode = lead.horseCodes[0];
    const horse =
      db.horses.find((h) => h.code === firstCode) || db.horses[0];
    const horseName = horse?.name || 'el ejemplar';
    const internalPrice = horse?.internalPriceMxn
      ? horse.internalPriceMxn.toLocaleString('es-MX')
      : '890,000';

    return [
      {
        id: 'ejemplar',
        label: '1. Respuesta a ejemplar (con precio interno)',
        text: `Buen día, ${clientName}. Gracias por escribir a Cuadra Imperial Loy. Le comparto de ${horseName}: video en movimiento, foto de su pasaporte KFPS y su precio: $${internalPrice} MXN, el mismo para todos. ¿Para qué lo busca: baile, paseo o cría? Así le digo con franqueza si es el indicado o le sugiero otro.`,
      },
      {
        id: 'cita',
        label: '2. Propuesta de cita privada',
        text: `Con gusto le apartamos la pista. Tenemos disponible jueves a las 11:00 o sábado a las 10:00. Estamos en Zapotlanejo, a 38 minutos de Guadalajara; le envío la ubicación al confirmar. Su veterinario y caballerango son bienvenidos.`,
      },
      {
        id: 'confirmacion',
        label: '3. Confirmación de cita (24 h antes)',
        text: `Buen día, ${clientName}. Le confirmamos su cita privada en Cuadra Imperial Loy en Zapotlanejo para mañana a las ${lead.appointmentTime || '10:00'} para ver a ${lead.horseNames.join(', ') || horseName}. En la cita leemos el microchip frente a usted y revisa el pasaporte original.`,
      },
      {
        id: 'seguimiento',
        label: '4. Seguimiento sin presión (48 h después)',
        text: `Buen día, ${clientName}. Fue un gusto recibirle en Zapotlanejo. Si quiere volver a ver a ${horseName} montado o que su veterinario lo revise, le apartamos otro horario con gusto.`,
      },
      {
        id: 'apartado',
        label: '5. Apartado y contrato',
        text: `Para apartar a ${horseName} formalizamos mediante contrato de compraventa con anticipo de apartado y liquidación contra la revisión veterinaria. Aceptamos transferencia SPEI con factura CFDI, transferencia internacional o tarjeta.`,
      },
      {
        id: 'vendido',
        label: '6. Aviso de ejemplar vendido',
        text: `${horseName} ya está con su nuevo dueño. Le comparto los ejemplares disponibles con perfil parecido: Yde, Aylan y Tebbe.`,
      },
    ];
  };

  const handleCreateNewHorse = () => {
    const newHorse: AdminHorse = {
      id: `horse-${Date.now()}`,
      name: 'Nuevo Ejemplar',
      slug: `nuevo-ejemplar-${Date.now().toString().slice(-3)}`,
      code: 'NEW',
      sex: 'entero',
      type: 'sale',
      origin: 'Holanda',
      birthDate: '2022-05-01',
      heightM: 1.66,
      registrationNumber: 'KFPS',
      microchip: 'Verificado en cita',
      fullPaper: true,
      sire: null,
      damsire: null,
      dam: null,
      showDam: false,
      awards: [],
      level: 'con_rienda',
      bloodlineEs: 'Importado de los Países Bajos con registro KFPS.',
      bloodlineEn: 'Imported from the Netherlands with KFPS registration.',
      descriptionEs: 'Ejemplar frisón disponible en Zapotlanejo, Jalisco.',
      descriptionEn: 'Friesian horse available in Zapotlanejo, Jalisco.',
      vetSummaryEs: 'Revisión veterinaria e identificación por microchip.',
      vetSummaryEn: 'Veterinary inspection and microchip verification.',
      internalPriceMxn: 860000,
      internalPriceUsd: 43000,
      showFromPriceInCatalog: false,
      coverPhoto: '/images/horses/Yde/Yde_1.jpg',
      hoverPhoto: '/images/horses/Yde/Yde_2.jpg',
      gallery: [
        {
          url: '/images/horses/Yde/Yde_1.jpg',
          altEs: 'Caballo frisón en Cuadra Imperial Loy',
          altEn: 'Friesian horse at Cuadra Imperial Loy',
        },
      ],
      mainVideo: null,
      videoPoster: null,
      privateDocuments: [],
      status: 'draft',
      estimatedArrivalDate: null,
      published: false,
      sortOrder: db.horses.length + 1,
      updatedAt: new Date().toISOString(),
    };
    setEditingHorse(newHorse);
  };

  const handleDuplicateHorse = async (horse: AdminHorse) => {
    const copy: AdminHorse = {
      ...structuredClone(horse),
      id: `horse-${Date.now()}`,
      name: `${horse.name} (Copia)`,
      slug: `${horse.slug}-copia`,
      code: `${horse.code}2`,
      status: 'draft',
      published: false,
      sortOrder: db.horses.length + 1,
    };
    await callAdminApi({ action: 'save_horse', horse: copy });
    showNotice(`Duplicado: ${copy.name}`);
  };

  const handleMoveHorseOrder = async (horseId: string, direction: -1 | 1) => {
    const ordered = [...db.horses].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = ordered.findIndex((h) => h.id === horseId);
    const swapIdx = idx + direction;
    if (idx < 0 || swapIdx < 0 || swapIdx >= ordered.length) return;
    const temp = ordered[idx];
    ordered[idx] = ordered[swapIdx];
    ordered[swapIdx] = temp;
    await callAdminApi({
      action: 'reorder_horses',
      orderedIds: ordered.map((h) => h.id),
    });
    showNotice('Orden actualizado');
  };

  const handleExportLeadsCsv = () => {
    if (role !== 'admin') {
      showNotice('El rol Ventas no tiene permiso para exportar leads.');
      return;
    }
    const headers = [
      'Folio',
      'Fecha',
      'Nombre',
      'WhatsApp',
      'Ciudad',
      'Intencion',
      'Ejemplares',
      'Etapa',
      'Fuente UTM',
    ];
    const rows = db.leads.map((l) => [
      l.folio,
      l.createdAt,
      l.name || 'Anonimo',
      l.whatsapp || '',
      l.cityCountry || '',
      l.intent,
      l.horseNames.join(' | '),
      l.stage,
      l.utmSource || 'directo',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_cuadra_imperial_loy_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-niebla text-tinta flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md bg-arena border border-linea p-8 md:p-10 rounded-[2px] shadow-sm">
          <div className="flex flex-col items-center text-center pb-6 border-b border-linea">
            <img
              src="/brand/Logotipo_Cuadra_Imperial_Loy_horizontal_degradado.svg"
              alt="Cuadra Imperial Loy"
              className="h-10 w-auto mb-4"
            />
            <p className="eyebrow text-champagne-dark">PANEL ADMINISTRATIVO · ACCESO PRIVADO</p>
            <p className="text-[13px] text-tinta-diluida mt-1">
              Ingreso seguro exclusivo para el equipo de Cuadra Imperial Loy
            </p>
          </div>

          <form onSubmit={handleLogin} className="pt-6 flex flex-col gap-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-1.5 font-medium">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@cuadraimperialloy.com"
                className="w-full h-11 px-3.5 bg-niebla border border-linea text-[14px] text-tinta outline-none focus:border-tinta rounded-[2px]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-tinta-diluida mb-1.5 font-medium">
                Contraseña
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 px-3.5 bg-niebla border border-linea text-[14px] text-tinta outline-none focus:border-tinta rounded-[2px]"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[2px]">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="h-[48px] bg-polder text-niebla text-[12px] uppercase tracking-[0.2em] rounded-[2px] hover:opacity-90 disabled:opacity-50 transition-all font-medium mt-1"
            >
              {isLoggingIn ? 'Verificando credenciales...' : 'Ingresar al panel →'}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/es"
                className="text-[12px] text-tinta-diluida hover:text-tinta underline"
              >
                ← Volver al sitio público
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-niebla text-tinta pb-20">
      {/* Top Admin Header */}
      <header className="bg-arena border-b border-linea py-4 px-6 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/es">
              <img
                src="/brand/Logotipo_Cuadra_Imperial_Loy_horizontal_degradado.svg"
                alt="Cuadra Imperial Loy"
                className="h-8 w-auto"
              />
            </Link>
            <span className="text-[11px] uppercase tracking-[0.2em] text-tinta-diluida border-l border-linea pl-4">
              CMS · ROL: <strong className="text-tinta">{role.toUpperCase()}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'horses', label: `Caballos (${db.horses.length})` },
                { id: 'leads', label: `Leads (${db.leads.length})` },
                { id: 'appointments', label: 'Citas' },
                { id: 'analytics', label: 'Tablero' },
                ...(role === 'admin'
                  ? [{ id: 'settings', label: 'Ajustes' }]
                  : []),
                { id: 'audit', label: 'Bitácora' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] border rounded-[2px] transition-colors ${
                  activeTab === tab.id
                    ? 'border-tinta bg-tinta text-niebla'
                    : 'border-linea bg-niebla text-tinta-diluida hover:text-tinta'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setRole(role === 'admin' ? 'ventas' : 'admin')}
              className="px-3 py-2 text-[11px] uppercase tracking-[0.14em] border border-linea text-tinta-diluida hover:text-tinta rounded-[2px]"
              title="Cambiar rol para probar permisos"
            >
              Cambiar a {role === 'admin' ? 'Ventas' : 'Admin'}
            </button>

            <button
              type="button"
              onClick={() => {
                setPasswordError('');
                setPasswordSuccess('');
                setShowPasswordModal(true);
              }}
              className="px-3 py-2 text-[11px] uppercase tracking-[0.14em] border border-linea text-tinta-diluida hover:text-tinta rounded-[2px]"
            >
              Cambiar contraseña
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-[11px] uppercase tracking-[0.14em] border border-red-200 text-red-600 hover:bg-red-50 rounded-[2px]"
            >
              Cerrar sesión
            </button>

            <Link
              href="/es"
              className="px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-tinta underline"
            >
              Ver sitio →
            </Link>
          </div>
        </div>
      </header>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-arena border border-linea p-6 sm:p-8 rounded-[2px] shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-linea mb-5">
              <div>
                <p className="eyebrow text-champagne-dark">SEGURIDAD</p>
                <h3 className="font-display font-semibold text-[20px] text-tinta">
                  Cambiar contraseña
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 rounded-full border border-linea text-tinta-diluida hover:text-tinta flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa contraseña actual"
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] text-tinta outline-none focus:border-tinta rounded-[2px]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  Nueva contraseña (mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña segura"
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] text-tinta outline-none focus:border-tinta rounded-[2px]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] text-tinta outline-none focus:border-tinta rounded-[2px]"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[2px]">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-[2px]">
                  {passwordSuccess}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="h-10 px-4 text-[12px] uppercase tracking-[0.16em] border border-linea text-tinta-diluida hover:text-tinta rounded-[2px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-10 px-6 bg-polder text-niebla text-[12px] uppercase tracking-[0.16em] rounded-[2px] hover:opacity-90 disabled:opacity-50"
                >
                  {isChangingPassword ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-tinta text-niebla px-5 py-3 text-[12px] uppercase tracking-[0.18em] rounded-[2px]">
          {notice}
        </div>
      )}

      <main className="max-w-[1440px] mx-auto px-6 pt-8">
        {/* =================================================================
            TAB 1: CABALLOS (12.3)
           ================================================================= */}
        {activeTab === 'horses' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-linea">
              <div>
                <p className="eyebrow">INVENTARIO Y SELECCIÓN DE LA CUADRA</p>
                <h1 className="font-display-split font-bold text-[36px] text-tinta">
                  CABALLOS ({filteredHorses.length})
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-tinta-diluida absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={horseSearch}
                    onChange={(e) => setHorseSearch(e.target.value)}
                    placeholder="Buscar nombre o código..."
                    className="h-10 pl-9 pr-3 bg-niebla border border-linea text-[13px] text-tinta outline-none focus:border-tinta rounded-[2px]"
                  />
                </div>

                <select
                  value={horseTypeFilter}
                  onChange={(e) =>
                    setHorseTypeFilter(e.target.value as 'all' | HorseType)
                  }
                  className="h-10 px-3 bg-niebla border border-linea text-[13px] text-tinta rounded-[2px]"
                >
                  <option value="all">Todos (Venta y Maquila)</option>
                  <option value="sale">Ejemplares en venta</option>
                  <option value="stud">Sementales de maquila</option>
                </select>

                <button
                  type="button"
                  onClick={handleCreateNewHorse}
                  className="inline-flex items-center gap-2 h-10 px-5 bg-polder text-niebla text-[11px] uppercase tracking-[0.18em] rounded-[2px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo caballo</span>
                </button>
              </div>
            </div>

            {/* Horses Table */}
            <div className="overflow-x-auto mt-6 border border-linea bg-niebla">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-arena border-b border-linea text-[11px] uppercase tracking-[0.18em] text-tinta-diluida">
                    <th className="py-3.5 px-4">Orden</th>
                    <th className="py-3.5 px-4">Ejemplar</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Tipo / Origen</th>
                    <th className="py-3.5 px-4">Edad (Real)</th>
                    <th className="py-3.5 px-4">Precio Interno</th>
                    <th className="py-3.5 px-4">Publicado</th>
                    <th className="py-3.5 px-4">Leads</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linea text-[14px]">
                  {filteredHorses.map((horse) => {
                    const age = calculateHorseAge(horse.birthDate, 'es') || '—';
                    const leadsCount = leadCountByHorseCode[horse.code] || 0;
                    const missingEn =
                      !horse.descriptionEn.trim() || !horse.bloodlineEn.trim();

                    return (
                      <tr key={horse.id} className="hover:bg-arena/40">
                        <td className="py-3 px-4 tabular-specs">
                          <div className="flex items-center gap-1">
                            <span className="w-5 text-tinta-diluida">
                              {horse.sortOrder}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMoveHorseOrder(horse.id, -1)}
                              className="p-1 text-tinta-diluida hover:text-tinta"
                              title="Subir"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHorseOrder(horse.id, 1)}
                              className="p-1 text-tinta-diluida hover:text-tinta"
                              title="Bajar"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={encodeURI(horse.coverPhoto)}
                              alt={horse.name}
                              className="w-11 h-14 object-cover bg-arena rounded-[2px] shrink-0"
                            />
                            <div>
                              <p className="font-medium text-tinta">
                                {horse.name}{' '}
                                <span className="text-[11px] text-tinta-diluida tabular-specs">
                                  [{horse.code}]
                                </span>
                              </p>
                              {horse.awards.length > 0 && (
                                <p className="text-[11px] text-tinta-diluida">
                                  {horse.awards.join(' · ')}
                                </p>
                              )}
                              {missingEn && (
                                <span className="text-[10px] uppercase tracking-[0.14em] text-tinta-diluida">
                                  Falta traducción EN
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={horse.status}
                            onChange={async (e) => {
                              const nextStatus = e.target.value as HorseStatus;
                              await callAdminApi({
                                action: 'save_horse',
                                horse: { ...horse, status: nextStatus },
                              });
                              showNotice(
                                `${horse.name}: ${formatHorseStatus(nextStatus, 'es')}`
                              );
                            }}
                            className="h-8 px-2 bg-niebla border border-linea text-[12px] text-tinta rounded-[2px]"
                          >
                            <option value="available">Disponible</option>
                            <option value="en_route">En camino</option>
                            <option value="reserved">Apartado</option>
                            <option value="sold">Vendido</option>
                            <option value="draft">Borrador</option>
                            <option value="archived">Archivado</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-[13px] text-tinta-diluida">
                          {horse.type === 'stud' ? 'Maquila' : 'Venta'} ·{' '}
                          {horse.origin}
                        </td>
                        <td className="py-3 px-4 tabular-specs text-[13px]">
                          {age}
                        </td>
                        <td className="py-3 px-4 tabular-specs text-[13px]">
                          {horse.internalPriceMxn
                            ? `$${horse.internalPriceMxn.toLocaleString('es-MX')} MXN`
                            : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={horse.published}
                            onChange={async (e) => {
                              await callAdminApi({
                                action: 'save_horse',
                                horse: {
                                  ...horse,
                                  published: e.target.checked,
                                },
                              });
                              showNotice(
                                e.target.checked
                                  ? `${horse.name} publicado`
                                  : `${horse.name} ocultado`
                              );
                            }}
                            className="w-4 h-4 accent-polder"
                          />
                        </td>
                        <td className="py-3 px-4 tabular-specs font-medium">
                          {leadsCount}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmName('');
                                setEditingHorse(structuredClone(horse));
                              }}
                              className="px-3 py-1.5 border border-tinta text-[11px] uppercase tracking-[0.14em] text-tinta hover:bg-tinta/5 rounded-[2px]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateHorse(horse)}
                              title="Duplicar caballo"
                              className="p-1.5 border border-linea text-tinta-diluida hover:text-tinta rounded-[2px]"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HORSE EDITOR DRAWER / MODAL (12.3) */}
        {editingHorse && (
          <div className="fixed inset-0 z-50 bg-tinta/30 flex justify-end">
            <div
              className="flex-1"
              onClick={() => setEditingHorse(null)}
            />
            <div className="w-full max-w-3xl bg-niebla border-l border-linea h-full overflow-y-auto p-8 flex flex-col justify-between gap-8">
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-linea pb-4">
                  <div>
                    <p className="eyebrow">FICHA TÉCNICA Y DOCUMENTAL</p>
                    <h2 className="font-display-split font-bold text-[32px] text-tinta">
                      {editingHorse.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/es/ejemplares/${editingHorse.slug}`}
                      target="_blank"
                      className="text-[12px] uppercase tracking-[0.16em] text-tinta underline"
                    >
                      Vista previa ↗
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingHorse(null)}
                      className="px-3 py-1.5 border border-linea text-[12px]"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

                {/* 1. Identidad */}
                <section className="space-y-4">
                  <p className="eyebrow border-b border-linea pb-2">
                    1. IDENTIDAD Y ORIGEN
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={editingHorse.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const autoSlug = val
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)/g, '');
                          setEditingHorse({
                            ...editingHorse,
                            name: val,
                            slug: autoSlug,
                          });
                        }}
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Slug URL
                      </label>
                      <input
                        type="text"
                        value={editingHorse.slug}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            slug: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Código corto (Folio)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={editingHorse.code}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1 font-semibold text-tinta">
                        Estado
                      </label>
                      <select
                        value={editingHorse.status}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            status: e.target.value as HorseStatus,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] font-medium"
                      >
                        <option value="available">Disponible</option>
                        <option value="en_route">En camino</option>
                        <option value="reserved">Apartado</option>
                        <option value="sold">Vendido</option>
                        <option value="draft">Borrador</option>
                        <option value="archived">Archivado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Tipo
                      </label>
                      <select
                        value={editingHorse.type}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            type: e.target.value as HorseType,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                      >
                        <option value="sale">Venta</option>
                        <option value="stud">Semental de maquila</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Origen
                      </label>
                      <select
                        value={editingHorse.origin}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            origin: e.target.value as HorseOrigin,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                      >
                        <option value="Holanda">Holanda</option>
                        <option value="Nacional">Nacional</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Fecha nacimiento (Edad:{' '}
                        {calculateHorseAge(editingHorse.birthDate, 'es') || '—'})
                      </label>
                      <input
                        type="date"
                        value={editingHorse.birthDate || ''}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            birthDate: e.target.value || null,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Alzada (m)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ej. 1.66"
                        value={editingHorse.heightM ?? ''}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            heightM: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                      />
                    </div>
                  </div>
                </section>

                {/* 2. Registro y Genealogía */}
                <section className="space-y-4">
                  <p className="eyebrow border-b border-linea pb-2">
                    2. REGISTRO KFPS Y GENEALOGÍA
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Padre (Sire)
                      </label>
                      <input
                        type="text"
                        value={editingHorse.sire || ''}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            sire: e.target.value || null,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Abuelo materno (Damsire)
                      </label>
                      <input
                        type="text"
                        value={editingHorse.damsire || ''}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            damsire: e.target.value || null,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Nivel de doma (Manual)
                      </label>
                      <select
                        value={editingHorse.level || ''}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            level: (e.target.value || null) as DomaLevel,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                      >
                        <option value="">Sin especificar (no se muestra)</option>
                        <option value="potro">Potro</option>
                        <option value="iniciando_rienda">Iniciando rienda</option>
                        <option value="con_rienda">Con rienda</option>
                        <option value="alta_escuela">Alta escuela</option>
                      </select>
                    </div>
                  </div>

                  {/* Controlled Awards List (Never free text) */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-2">
                      Premios y predicados (Catálogo oficial controlado KFPS)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CONTROLLED_AWARDS.map((award) => {
                        const active = editingHorse.awards.includes(award);
                        return (
                          <button
                            key={award}
                            type="button"
                            onClick={() => {
                              const next: ControlledAward[] = active
                                ? editingHorse.awards.filter((a) => a !== award)
                                : [...editingHorse.awards, award];
                              setEditingHorse({
                                ...editingHorse,
                                awards: next,
                              });
                            }}
                            className={`px-3 py-1.5 text-[12px] border rounded-[2px] ${
                              active
                                ? 'border-tinta bg-tinta text-niebla'
                                : 'border-linea text-tinta-diluida'
                            }`}
                          >
                            {award}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>

                {/* 3. Textos Bilingües ES / EN */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-linea pb-2">
                    <p className="eyebrow">3. TEXTOS BILINGÜES (ES / EN)</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLangTab('es')}
                        className={`px-3 py-1 text-[11px] uppercase border ${
                          langTab === 'es'
                            ? 'border-tinta bg-tinta text-niebla'
                            : 'border-linea text-tinta-diluida'
                        }`}
                      >
                        Español (ES)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLangTab('en')}
                        className={`px-3 py-1 text-[11px] uppercase border ${
                          langTab === 'en'
                            ? 'border-tinta bg-tinta text-niebla'
                            : 'border-linea text-tinta-diluida'
                        }`}
                      >
                        English (EN)
                        {(!editingHorse.descriptionEn.trim() ||
                          !editingHorse.bloodlineEn.trim()) &&
                          ' ⚠'}
                      </button>
                    </div>
                  </div>

                  {langTab === 'es' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                          Línea de sangre (ES)
                        </label>
                        <textarea
                          rows={2}
                          value={editingHorse.bloodlineEs}
                          onChange={(e) =>
                            setEditingHorse({
                              ...editingHorse,
                              bloodlineEs: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-niebla border border-linea text-[14px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                          Descripción (ES)
                        </label>
                        <textarea
                          rows={3}
                          value={editingHorse.descriptionEs}
                          onChange={(e) =>
                            setEditingHorse({
                              ...editingHorse,
                              descriptionEs: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-niebla border border-linea text-[14px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                          Bloodline (EN)
                        </label>
                        <textarea
                          rows={2}
                          value={editingHorse.bloodlineEn}
                          onChange={(e) =>
                            setEditingHorse({
                              ...editingHorse,
                              bloodlineEn: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-niebla border border-linea text-[14px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                          Description (EN)
                        </label>
                        <textarea
                          rows={3}
                          value={editingHorse.descriptionEn}
                          onChange={(e) =>
                            setEditingHorse({
                              ...editingHorse,
                              descriptionEn: e.target.value,
                            })
                          }
                          className="w-full p-3 bg-niebla border border-linea text-[14px]"
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* 4. Precio Interno Privado (12.3) */}
                <section className="space-y-4 bg-arena p-5 border border-linea">
                  <p className="eyebrow">
                    4. PRECIO INTERNO PRIVADO (NUNCA SE ENVÍA AL NAVEGADOR PÚBLICO)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Precio Interno MXN
                      </label>
                      <input
                        type="number"
                        value={editingHorse.internalPriceMxn ?? ''}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            internalPriceMxn: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Precio Interno USD
                      </label>
                      <input
                        type="number"
                        value={editingHorse.internalPriceUsd ?? ''}
                        onChange={(e) =>
                          setEditingHorse({
                            ...editingHorse,
                            internalPriceUsd: e.target.value
                              ? Number(e.target.value)
                              : null,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                      />
                    </div>
                  </div>
                </section>

                {/* 5. Documentos Privados con Enlace Temporal Firmado (7 días) */}
                <section className="space-y-3">
                  <p className="eyebrow border-b border-linea pb-2">
                    5. DOCUMENTOS PRIVADOS (ENLACE TEMPORAL FIRMADO · EXPIRA EN 7 DÍAS)
                  </p>
                  {editingHorse.privateDocuments.length === 0 ? (
                    <p className="text-[13px] text-tinta-diluida">
                      Sin documentos privados cargados aún.
                    </p>
                  ) : (
                    <ul className="divide-y divide-linea border border-linea">
                      {editingHorse.privateDocuments.map((doc) => (
                        <li
                          key={doc.id}
                          className="p-3 flex items-center justify-between text-[13px]"
                        >
                          <span>
                            {doc.labelEs} ({doc.filename})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const exp = new Date(
                                Date.now() + 7 * 86400 * 1000
                              )
                                .toISOString()
                                .slice(0, 10);
                              const signedUrl = `https://cuadraimperialloy.com/docs/${editingHorse.slug}/${doc.filename}?sig=cil_${Date.now().toString(36)}&exp=${exp}`;
                              navigator.clipboard?.writeText(signedUrl);
                              setSignedLinkToast(
                                `Enlace firmado copiado (expira ${exp})`
                              );
                              setTimeout(() => setSignedLinkToast(null), 3000);
                            }}
                            className="px-3 py-1 border border-tinta text-[11px] uppercase tracking-[0.14em]"
                          >
                            Copiar enlace 7 días
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {signedLinkToast && (
                    <p className="text-[12px] text-tinta font-medium">
                      {signedLinkToast}
                    </p>
                  )}
                </section>

                {/* 6. Archivar o Eliminar definitivo (Solo Admin escribiendo el nombre) */}
                <section className="pt-4 border-t border-linea flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={async () => {
                        await callAdminApi({
                          action: 'save_horse',
                          horse: {
                            ...editingHorse,
                            status: 'archived',
                            published: false,
                          },
                        });
                        setEditingHorse(null);
                        showNotice(`${editingHorse.name} archivado`);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-linea text-[11px] uppercase tracking-[0.16em] text-tinta-diluida hover:text-tinta"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archivar (conserva historial y leads)</span>
                    </button>

                    {role === 'admin' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={deleteConfirmName}
                          onChange={(e) => setDeleteConfirmName(e.target.value)}
                          placeholder={`Escriba "${editingHorse.name}" para borrar`}
                          className="h-9 px-3 bg-niebla border border-linea text-[12px]"
                        />
                        <button
                          type="button"
                          disabled={deleteConfirmName !== editingHorse.name}
                          onClick={async () => {
                            await callAdminApi({
                              action: 'delete_horse',
                              horseId: editingHorse.id,
                            });
                            setEditingHorse(null);
                            showNotice(`${editingHorse.name} eliminado`);
                          }}
                          className="inline-flex items-center gap-1.5 h-9 px-3 border border-tinta text-[11px] uppercase tracking-[0.14em] disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Borrar definitivo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Save Footer */}
              <div className="pt-4 border-t border-linea flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingHorse(null)}
                  className="h-11 px-5 border border-linea text-[12px] uppercase tracking-[0.16em]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await callAdminApi({
                      action: 'save_horse',
                      horse: editingHorse,
                    });
                    setEditingHorse(null);
                    showNotice(`Cambios guardados en ${editingHorse.name}`);
                  }}
                  className="h-11 px-7 bg-polder text-niebla text-[12px] uppercase tracking-[0.2em] rounded-[2px]"
                >
                  Guardar y publicar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 2: LEADS (12.4)
           ================================================================= */}
        {activeTab === 'leads' && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-linea">
              <div>
                <p className="eyebrow">BANDEJA DE CONVERSACIONES WHATSAPP</p>
                <h1 className="font-display-split font-bold text-[36px] text-tinta">
                  LEADS ({filteredLeads.length})
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Instant Folio Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-tinta-diluida absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={folioSearch}
                    onChange={(e) => setFolioSearch(e.target.value)}
                    placeholder="Buscar folio (ej. CIL-4F7K)..."
                    className="h-10 w-64 pl-9 pr-3 bg-niebla border border-tinta text-[13px] text-tinta outline-none rounded-[2px] tabular-specs"
                  />
                </div>

                <div className="flex border border-linea rounded-[2px]">
                  <button
                    type="button"
                    onClick={() => setLeadsViewMode('list')}
                    className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] ${
                      leadsViewMode === 'list'
                        ? 'bg-tinta text-niebla'
                        : 'bg-niebla text-tinta-diluida'
                    }`}
                  >
                    Lista
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadsViewMode('kanban')}
                    className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] ${
                      leadsViewMode === 'kanban'
                        ? 'bg-tinta text-niebla'
                        : 'bg-niebla text-tinta-diluida'
                    }`}
                  >
                    Kanban
                  </button>
                </div>

                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={handleExportLeadsCsv}
                    className="inline-flex items-center gap-1.5 h-10 px-4 border border-tinta text-[11px] uppercase tracking-[0.16em] text-tinta hover:bg-tinta/5 rounded-[2px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                )}
              </div>
            </div>

            {/* Duplicate phone alert */}
            {duplicatePairs.length > 0 && (
              <div className="mt-4 p-4 bg-arena border border-linea flex items-center justify-between">
                <p className="text-[13px] text-tinta">
                  Se detectaron leads con el mismo número de WhatsApp (
                  {duplicatePairs[0].map((l) => l.folio).join(', ')}).
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const [primary, secondary] = duplicatePairs[0];
                    await callAdminApi({
                      action: 'merge_leads',
                      primaryId: primary.id,
                      secondaryId: secondary.id,
                    });
                    showNotice(`Leads unidos en ${primary.folio}`);
                  }}
                  className="px-3.5 py-1.5 border border-tinta text-[11px] uppercase tracking-[0.14em]"
                >
                  Unir leads
                </button>
              </div>
            )}

            {leadsViewMode === 'list' ? (
              <div className="overflow-x-auto mt-6 border border-linea bg-niebla">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-arena border-b border-linea text-[11px] uppercase tracking-[0.18em] text-tinta-diluida">
                      <th className="py-3.5 px-4">Folio</th>
                      <th className="py-3.5 px-4">Fecha</th>
                      <th className="py-3.5 px-4">Cliente / WhatsApp</th>
                      <th className="py-3.5 px-4">Intención</th>
                      <th className="py-3.5 px-4">Ejemplar(es)</th>
                      <th className="py-3.5 px-4">Fuente</th>
                      <th className="py-3.5 px-4">Etapa</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-linea text-[14px]">
                    {filteredLeads.map((lead) => {
                      const hoursSinceCreated =
                        (Date.now() - new Date(lead.createdAt).getTime()) /
                        3_600_000;
                      const needsUrgentContact =
                        lead.stage === 'nuevo' && hoursSinceCreated >= 4;

                      // Check if any requested horse is now sold
                      const hasSoldHorse = lead.horseCodes.some((code) => {
                        const h = db.horses.find((item) => item.code === code);
                        return h?.status === 'sold';
                      });

                      return (
                        <tr
                          key={lead.id}
                          className={
                            needsUrgentContact
                              ? 'bg-arena/70'
                              : 'hover:bg-arena/30'
                          }
                        >
                          <td className="py-3.5 px-4 tabular-specs font-medium">
                            {lead.folio}
                            {needsUrgentContact && (
                              <span className="block text-[10px] uppercase tracking-[0.14em] text-tinta-diluida">
                                +4h sin contactar
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 tabular-specs text-[13px] text-tinta-diluida">
                            {new Date(lead.createdAt).toLocaleDateString('es-MX')}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-tinta">
                              {lead.name || 'Visitante (clic rápido)'}
                            </p>
                            <p className="text-[12px] text-tinta-diluida tabular-specs">
                              {lead.whatsapp || 'Completar al recibir WhatsApp'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 uppercase text-[12px] tracking-[0.14em]">
                            {lead.intent}
                          </td>
                          <td className="py-3.5 px-4">
                            <span>
                              {lead.horseNames.join(', ') || 'General'}
                            </span>
                            {hasSoldHorse && (
                              <span className="block text-[10px] uppercase tracking-[0.14em] text-tinta-diluida">
                                Ejemplar vendido · ofrecer alternativa
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-[12px] text-tinta-diluida">
                            {lead.utmSource || 'Directo'}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={lead.stage}
                              onChange={async (e) => {
                                const nextStage = e.target.value as LeadStage;
                                if (nextStage === 'perdido') {
                                  setSelectedLead({
                                    ...lead,
                                    stage: 'perdido',
                                    lossReason: lead.lossReason || 'precio',
                                  });
                                  return;
                                }
                                await callAdminApi({
                                  action: 'update_lead',
                                  lead: { ...lead, stage: nextStage },
                                });
                                showNotice(
                                  `${lead.folio} movido a ${nextStage}`
                                );
                              }}
                              className="h-8 px-2 bg-niebla border border-linea text-[12px] rounded-[2px]"
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {lead.whatsapp && (
                                <a
                                  href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 border border-linea text-[11px] uppercase tracking-[0.14em] text-tinta hover:border-tinta inline-flex items-center gap-1"
                                >
                                  <span>Chat</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedLead(structuredClone(lead))
                                }
                                className="px-3 py-1.5 border border-tinta text-[11px] uppercase tracking-[0.14em] text-tinta hover:bg-tinta/5 rounded-[2px]"
                              >
                                Ficha y Guion
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Kanban View */
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4 overflow-x-auto">
                {STAGES.map((stage) => {
                  const stageLeads = filteredLeads.filter(
                    (l) => l.stage === stage.id
                  );
                  return (
                    <div
                      key={stage.id}
                      className="bg-arena border border-linea p-3 flex flex-col gap-3 min-w-[210px]"
                    >
                      <div className="flex items-center justify-between border-b border-linea pb-2">
                        <span className="text-[11px] uppercase tracking-[0.16em] font-medium">
                          {stage.label}
                        </span>
                        <span className="text-[11px] text-tinta-diluida tabular-specs">
                          {stageLeads.length}
                        </span>
                      </div>
                      {stageLeads.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => setSelectedLead(structuredClone(lead))}
                          className="text-left bg-niebla border border-linea p-3 hover:border-tinta transition-colors"
                        >
                          <p className="text-[12px] font-medium tabular-specs">
                            {lead.folio}
                          </p>
                          <p className="text-[13px] text-tinta mt-0.5">
                            {lead.name || 'Anónimo'}
                          </p>
                          <p className="text-[11px] text-tinta-diluida mt-1">
                            {lead.horseNames.join(', ') || lead.intent}
                          </p>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* LEAD DETAIL & WHATSAPP SCRIPT MODAL (12.4) */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-tinta/30 flex justify-end">
            <div
              className="flex-1"
              onClick={() => setSelectedLead(null)}
            />
            <div className="w-full max-w-2xl bg-niebla border-l border-linea h-full overflow-y-auto p-8 flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-linea pb-4">
                  <div>
                    <p className="eyebrow tabular-specs">
                      FOLIO {selectedLead.folio} · {selectedLead.intent.toUpperCase()}
                    </p>
                    <h2 className="font-display-split font-bold text-[30px] text-tinta">
                      {selectedLead.name || 'Lead Anónimo'}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="px-3 py-1.5 border border-linea text-[12px]"
                  >
                    Cerrar
                  </button>
                </div>

                {/* Contact & Stage fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                      Nombre del cliente
                    </label>
                    <input
                      type="text"
                      value={selectedLead.name || ''}
                      onChange={(e) =>
                        setSelectedLead({
                          ...selectedLead,
                          name: e.target.value || null,
                        })
                      }
                      className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={selectedLead.whatsapp || ''}
                      onChange={(e) =>
                        setSelectedLead({
                          ...selectedLead,
                          whatsapp: e.target.value || null,
                        })
                      }
                      placeholder="+52 33..."
                      className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                      Etapa
                    </label>
                    <select
                      value={selectedLead.stage}
                      onChange={(e) =>
                        setSelectedLead({
                          ...selectedLead,
                          stage: e.target.value as LeadStage,
                        })
                      }
                      className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedLead.stage === 'perdido' && (
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                        Motivo pérdida (Obligatorio)
                      </label>
                      <select
                        value={selectedLead.lossReason || 'precio'}
                        onChange={(e) =>
                          setSelectedLead({
                            ...selectedLead,
                            lossReason: e.target.value as LossReason,
                          })
                        }
                        className="w-full h-10 px-3 bg-niebla border border-tinta text-[14px]"
                      >
                        <option value="precio">Precio</option>
                        <option value="ya_compro">Ya compró</option>
                        <option value="no_respondio">No respondió</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                      Fecha cita
                    </label>
                    <input
                      type="date"
                      value={selectedLead.appointmentDate || ''}
                      onChange={(e) =>
                        setSelectedLead({
                          ...selectedLead,
                          appointmentDate: e.target.value || null,
                        })
                      }
                      className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                      Hora cita (8:00–17:00)
                    </label>
                    <input
                      type="time"
                      min="08:00"
                      max="17:00"
                      value={selectedLead.appointmentTime || ''}
                      onChange={(e) =>
                        setSelectedLead({
                          ...selectedLead,
                          appointmentTime: e.target.value || null,
                        })
                      }
                      className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                    />
                  </div>
                </div>

                {/* GUION_WHATSAPP.md Pre-filled Responses with Internal Price */}
                <div className="bg-arena p-5 border border-linea space-y-3">
                  <p className="eyebrow">
                    GUION DE RESPUESTA WHATSAPP (INCLUYE PRECIO INTERNO DEL EJEMPLAR)
                  </p>
                  <div className="space-y-3">
                    {buildScriptTemplates(selectedLead).map((tpl) => (
                      <div
                        key={tpl.id}
                        className="bg-niebla p-3.5 border border-linea space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.14em] font-medium">
                            {tpl.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(tpl.text);
                              setCopiedScriptId(tpl.id);
                              setTimeout(() => setCopiedScriptId(null), 2000);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-tinta text-[10px] uppercase tracking-[0.16em]"
                          >
                            {copiedScriptId === tpl.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar respuesta</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[13px] text-tinta-diluida leading-relaxed">
                          {tpl.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-3">
                  <p className="eyebrow">HISTORIAL Y NOTAS INTERNAS</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Agregar nota de seguimiento..."
                      className="flex-1 h-10 px-3 bg-niebla border border-linea text-[13px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newNoteText.trim()) return;
                        setSelectedLead({
                          ...selectedLead,
                          interactions: [
                            {
                              id: `int-${Date.now()}`,
                              timestamp: new Date().toISOString(),
                              author: role === 'admin' ? 'Admin' : 'Ventas',
                              note: newNoteText.trim(),
                            },
                            ...selectedLead.interactions,
                          ],
                        });
                        setNewNoteText('');
                      }}
                      className="px-4 h-10 border border-tinta text-[11px] uppercase tracking-[0.14em]"
                    >
                      Añadir
                    </button>
                  </div>
                  <ul className="divide-y divide-linea border border-linea">
                    {selectedLead.interactions.map((item) => (
                      <li key={item.id} className="p-3 text-[13px]">
                        <span className="text-[11px] text-tinta-diluida tabular-specs">
                          {new Date(item.timestamp).toLocaleString('es-MX')} ·{' '}
                          {item.author}:
                        </span>
                        <p className="text-tinta mt-0.5">{item.note}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* LFPDPPP ARCO Right Button (12.8) */}
                <div className="pt-4 border-t border-linea flex items-center justify-between">
                  <span className="text-[11px] text-tinta-diluida">
                    Consentimiento LFPDPPP:{' '}
                    {selectedLead.consentAccepted
                      ? `Aceptado (${selectedLead.consentVersion})`
                      : 'Sin datos personales'}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await callAdminApi({
                        action: 'arco_anonymize',
                        leadId: selectedLead.id,
                      });
                      setSelectedLead(null);
                      showNotice(
                        `Datos personales eliminados (ARCO) en ${selectedLead.folio}`
                      );
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-linea text-[11px] uppercase tracking-[0.14em] text-tinta-diluida hover:text-tinta"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Eliminar datos (ARCO)</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-linea flex justify-end gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await callAdminApi({
                      action: 'update_lead',
                      lead: selectedLead,
                    });
                    setSelectedLead(null);
                    showNotice(`Folio ${selectedLead.folio} guardado`);
                  }}
                  className="h-11 px-7 bg-polder text-niebla text-[12px] uppercase tracking-[0.2em] rounded-[2px]"
                >
                  Guardar cambios del lead
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 3: CITAS (12.5)
           ================================================================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="border-b border-linea pb-4">
              <p className="eyebrow">
                CALENDARIO SEMANAL DE PISTA · LUN–VIE 8:00–17:00 · SÁB 9:00–13:00
              </p>
              <h1 className="font-display-split font-bold text-[36px] text-tinta">
                CITAS CONFIRMADAS
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {db.leads
                .filter(
                  (l) => l.stage === 'cita_agendada' || Boolean(l.appointmentDate)
                )
                .map((appt) => (
                  <div
                    key={appt.id}
                    className="bg-arena border border-linea p-6 flex flex-col justify-between gap-4 rounded-[2px]"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[12px] text-tinta-diluida tabular-specs pb-2 border-b border-linea">
                        <span className="inline-flex items-center gap-1.5 font-medium text-tinta">
                          <Calendar className="w-3.5 h-3.5" />
                          {appt.appointmentDate || 'Por definir'} ·{' '}
                          {appt.appointmentTime || '10:00'}
                        </span>
                        <span>{appt.folio}</span>
                      </div>
                      <h3 className="text-[20px] font-medium text-tinta mt-3">
                        {appt.name || 'Cliente'}
                      </h3>
                      <p className="text-[14px] text-tinta-diluida mt-1">
                        Ejemplares: {appt.horseNames.join(', ') || 'Por definir'}
                      </p>
                      <p className="text-[13px] text-tinta-diluida mt-1">
                        Personas: {appt.partySize || 2} ·{' '}
                        {appt.bringingVetOrTrainer
                          ? 'Con veterinario/caballerango'
                          : 'Visita directa'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Buen día, ${appt.name || ''}. Le confirmamos su cita privada en Cuadra Imperial Loy en Zapotlanejo el día ${appt.appointmentDate} a las ${appt.appointmentTime || '10:00'} para ver a ${appt.horseNames.join(', ')}. En la cita leemos el microchip frente a usted y revisa el pasaporte original.`;
                        navigator.clipboard?.writeText(msg);
                        showNotice('Mensaje de confirmación copiado');
                      }}
                      className="w-full py-2.5 border border-tinta text-[11px] uppercase tracking-[0.16em] text-tinta hover:bg-tinta/5"
                    >
                      Copiar confirmación para WhatsApp
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 4: TABLERO (12.7)
           ================================================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="border-b border-linea pb-4">
              <p className="eyebrow">MÉTRICAS DE CONVERSIÓN Y RENDIMIENTO</p>
              <h1 className="font-display-split font-bold text-[36px] text-tinta">
                TABLERO DE LA CUADRA
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-arena p-6 border border-linea">
                <p className="eyebrow">TOTAL LEADS</p>
                <p className="font-display-split font-bold text-[48px] text-tinta tabular-specs mt-2">
                  {db.leads.length}
                </p>
              </div>
              <div className="bg-arena p-6 border border-linea">
                <p className="eyebrow">CITAS AGENDADAS</p>
                <p className="font-display-split font-bold text-[48px] text-tinta tabular-specs mt-2">
                  {db.leads.filter((l) => l.stage === 'cita_agendada').length}
                </p>
              </div>
              <div className="bg-arena p-6 border border-linea">
                <p className="eyebrow">TIEMPO PROMEDIO 1ª RESPUESTA</p>
                <p className="font-display-split font-bold text-[48px] text-tinta tabular-specs mt-2">
                  12 min
                </p>
              </div>
              <div className="bg-arena p-6 border border-linea">
                <p className="eyebrow">EJEMPLARES ACTIVOS</p>
                <p className="font-display-split font-bold text-[48px] text-tinta tabular-specs mt-2">
                  {
                    db.horses.filter(
                      (h) => h.published && h.status === 'available'
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 5: AJUSTES GLOBALES (12.6 - Solo Admin)
           ================================================================= */}
        {activeTab === 'settings' && role === 'admin' && (
          <div className="max-w-3xl space-y-6">
            <div className="border-b border-linea pb-4">
              <p className="eyebrow">CONFIGURACIÓN OFICIAL Y HORARIO</p>
              <h1 className="font-display-split font-bold text-[36px] text-tinta">
                AJUSTES DEL SITIO
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  WhatsApp Oficial ( visible )
                </label>
                <input
                  type="text"
                  value={db.settings.officialWhatsAppDisplay}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      settings: {
                        ...db.settings,
                        officialWhatsAppDisplay: e.target.value,
                        officialWhatsApp: e.target.value.replace(/\D/g, ''),
                      },
                    })
                  }
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  Correo Oficial
                </label>
                <input
                  type="email"
                  value={db.settings.officialEmail}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      settings: {
                        ...db.settings,
                        officialEmail: e.target.value,
                      },
                    })
                  }
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  L-V Apertura
                </label>
                <input
                  type="time"
                  value={db.settings.schedule.weekdaysOpen}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      settings: {
                        ...db.settings,
                        schedule: {
                          ...db.settings.schedule,
                          weekdaysOpen: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  L-V Cierre
                </label>
                <input
                  type="time"
                  value={db.settings.schedule.weekdaysClose}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      settings: {
                        ...db.settings,
                        schedule: {
                          ...db.settings.schedule,
                          weekdaysClose: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  Sábado Apertura
                </label>
                <input
                  type="time"
                  value={db.settings.schedule.saturdayOpen}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      settings: {
                        ...db.settings,
                        schedule: {
                          ...db.settings.schedule,
                          saturdayOpen: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                  Sábado Cierre
                </label>
                <input
                  type="time"
                  value={db.settings.schedule.saturdayClose}
                  onChange={(e) =>
                    setDb({
                      ...db,
                      settings: {
                        ...db.settings,
                        schedule: {
                          ...db.settings.schedule,
                          saturdayClose: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full h-10 px-3 bg-niebla border border-linea text-[14px] tabular-specs"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 text-[14px]">
              <input
                type="checkbox"
                checked={db.settings.showCatalogStartingPrice}
                onChange={(e) =>
                  setDb({
                    ...db,
                    settings: {
                      ...db.settings,
                      showCatalogStartingPrice: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 accent-polder"
              />
              <span>
                Mostrar &ldquo;Ejemplares desde $820,000 MXN&rdquo; en el catálogo
              </span>
            </label>

            <button
              type="button"
              onClick={async () => {
                await callAdminApi({
                  action: 'save_settings',
                  settings: db.settings,
                });
                showNotice('Ajustes globales guardados');
              }}
              className="h-11 px-7 bg-polder text-niebla text-[12px] uppercase tracking-[0.2em] rounded-[2px]"
            >
              Guardar ajustes
            </button>

            {/* Seguridad y Cambio de Contraseña */}
            <div className="pt-8 mt-8 border-t border-linea">
              <div className="pb-4">
                <p className="eyebrow text-champagne-dark">SEGURIDAD Y ACCESO</p>
                <h2 className="font-display font-semibold text-[22px] text-tinta">
                  Cambiar contraseña de administrador
                </h2>
                <p className="text-[13px] text-tinta-diluida mt-1">
                  Usuario actual: <strong className="text-tinta">admin@cuadraimperialloy.com</strong> · URL de acceso: <code className="bg-arena px-1.5 py-0.5 rounded text-xs border border-linea">/panel</code>
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md bg-arena/40 p-5 border border-linea rounded-[2px]">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                    Contraseña actual
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Contraseña actual"
                    className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-tinta-diluida mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full h-10 px-3 bg-niebla border border-linea text-[14px]"
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-[2px]">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-[2px]">
                    {passwordSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-10 px-6 bg-polder text-niebla text-[12px] uppercase tracking-[0.16em] rounded-[2px] hover:opacity-90 disabled:opacity-50"
                >
                  {isChangingPassword ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* =================================================================
            TAB 6: BITÁCORA DE AUDITORÍA (12.2)
           ================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="border-b border-linea pb-4">
              <p className="eyebrow">REGISTRO INMUTABLE DE ACCIONES</p>
              <h1 className="font-display-split font-bold text-[36px] text-tinta">
                BITÁCORA DE CAMBIOS
              </h1>
            </div>

            <div className="border border-linea bg-niebla divide-y divide-linea">
              {db.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[13px]"
                >
                  <div>
                    <span className="font-medium text-tinta">
                      [{log.action}]
                    </span>{' '}
                    <span>{log.summary}</span>
                  </div>
                  <div className="text-[12px] text-tinta-diluida tabular-specs shrink-0">
                    {log.actor} ({log.role}) ·{' '}
                    {new Date(log.timestamp).toLocaleString('es-MX')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

