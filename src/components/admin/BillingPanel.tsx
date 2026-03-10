import { useState, useEffect } from 'react'
import {
  Plus, Trash2, Edit3, Check, X, Loader2, CreditCard,
  Crown, FileText, Users, TrendingUp, RefreshCw, Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { plansApi, billingApi, adminApi } from '@/lib/api'
import type { DBPlan, DBSubscription, DBPayment, BillingStats, AdminUser, PlanFeature } from '@/lib/api'

// ── helpers ───────────────────────────────────────────────────────────────────

const periodLabel: Record<string, string> = {
  month: 'месяц', year: 'год', forever: 'навсегда',
}

const statusColor: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  trial:     'bg-blue-100 text-blue-700',
  expired:   'bg-slate-100 text-slate-500',
  cancelled: 'bg-red-100 text-red-600',
  pending:   'bg-yellow-100 text-yellow-700',
  success:   'bg-green-100 text-green-700',
  failed:    'bg-red-100 text-red-600',
  refunded:  'bg-purple-100 text-purple-600',
}

const statusRu: Record<string, string> = {
  active: 'Активна', trial: 'Пробная', expired: 'Истекла', cancelled: 'Отменена',
  pending: 'Ожидание', success: 'Оплачено', failed: 'Ошибка', refunded: 'Возврат',
}

function fmt(n: number) { return n.toLocaleString('ru-RU') }
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('ru-KZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Plan Editor ───────────────────────────────────────────────────────────────

function PlanEditor({
  plan, onSave, onCancel,
}: {
  plan?: DBPlan
  onSave: (data: Partial<DBPlan>) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName]           = useState(plan?.name ?? '')
  const [desc, setDesc]           = useState(plan?.description ?? '')
  const [price, setPrice]         = useState(String(plan?.price ?? 0))
  const [period, setPeriod]       = useState<DBPlan['period']>(plan?.period ?? 'month')
  const [isPopular, setIsPopular] = useState(plan?.isPopular ?? false)
  const [badge, setBadge]         = useState(plan?.badge ?? '')
  const [order, setOrder]         = useState(String(plan?.order ?? 0))
  const [features, setFeatures]   = useState<PlanFeature[]>(
    (plan?.features as PlanFeature[]) ?? []
  )
  const [saving, setSaving] = useState(false)

  const addFeature = () => setFeatures(f => [...f, { text: '', included: true }])
  const removeFeature = (i: number) => setFeatures(f => f.filter((_, j) => j !== i))
  const updateFeature = (i: number, field: keyof PlanFeature, val: string | boolean) =>
    setFeatures(f => f.map((item, j) => j === i ? { ...item, [field]: val } : item))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        name, description: desc,
        price: parseInt(price) || 0,
        period,
        isPopular,
        badge: badge || undefined,
        order: parseInt(order) || 0,
        features: features.filter(f => f.text.trim()),
      })
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
      <h3 className="font-semibold text-slate-800">{plan ? 'Редактировать тариф' : 'Новый тариф'}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Название</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Премиум" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Цена (₸)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min={0}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Период</label>
          <select value={period} onChange={e => setPeriod(e.target.value as DBPlan['period'])}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <option value="month">Месяц</option>
            <option value="year">Год</option>
            <option value="forever">Бессрочно</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Порядок отображения</label>
          <input value={order} onChange={e => setOrder(e.target.value)} type="number"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1">Описание</label>
        <input value={desc} onChange={e => setDesc(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} />
          Популярный (выделить)
        </label>
        <div className="flex-1">
          <input value={badge} onChange={e => setBadge(e.target.value)}
            placeholder='Бейдж (напр. "Выгодно")'
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-500">Возможности тарифа</label>
          <button onClick={addFeature}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Добавить
          </button>
        </div>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => updateFeature(i, 'included', !f.included)}
                className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  f.included ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-white')}>
                {f.included && <Check className="w-3 h-3 text-green-600" />}
              </button>
              <input value={f.text} onChange={e => updateFeature(i, 'text', e.target.value)}
                placeholder="Описание возможности"
                className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm" />
              <button onClick={() => removeFeature(i)} className="text-slate-300 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving || !name}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Сохранить
        </button>
        <button onClick={onCancel} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
          Отмена
        </button>
      </div>
    </div>
  )
}

// ── Plans Panel ───────────────────────────────────────────────────────────────

function PlansPanel() {
  const [plans, setPlans]       = useState<DBPlan[]>([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState<DBPlan | null | 'new'>(null)

  const load = () => {
    setLoading(true)
    plansApi.listAll()
      .then(({ plans: d }) => setPlans(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSave = async (data: Partial<DBPlan>) => {
    if (editing === 'new') {
      await plansApi.create(data)
    } else if (editing) {
      await plansApi.update(editing.id, data)
    }
    setEditing(null)
    load()
  }

  const handleToggleActive = async (plan: DBPlan) => {
    await plansApi.update(plan.id, { isActive: !plan.isActive })
    load()
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Тарифные планы</h3>
          <p className="text-sm text-slate-500">Цены автоматически обновляются на странице /pricing</p>
        </div>
        <button onClick={() => setEditing('new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Новый тариф
        </button>
      </div>

      {editing && (
        <PlanEditor
          plan={editing === 'new' ? undefined : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className={cn(
            'bg-white rounded-2xl border p-5 space-y-3 relative',
            plan.isActive ? 'border-slate-200' : 'border-dashed border-slate-200 opacity-60'
          )}>
            {plan.isPopular && (
              <span className="absolute top-3 right-3 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> Popular
              </span>
            )}
            <div>
              <h4 className="font-semibold text-slate-800">{plan.name}</h4>
              <p className="text-xs text-slate-400">{plan.description}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{fmt(plan.price)} ₸</span>
              <span className="text-sm text-slate-400">/ {periodLabel[plan.period]}</span>
            </div>
            {plan.badge && (
              <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{plan.badge}</span>
            )}
            <div className="space-y-1">
              {(plan.features as PlanFeature[]).slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <Check className={cn('w-3 h-3 shrink-0', f.included ? 'text-green-500' : 'text-slate-300')} />
                  <span className={f.included ? '' : 'line-through text-slate-400'}>{f.text}</span>
                </div>
              ))}
              {(plan.features as PlanFeature[]).length > 4 && (
                <p className="text-xs text-slate-400">+{(plan.features as PlanFeature[]).length - 4} ещё</p>
              )}
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setEditing(plan)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50">
                <Edit3 className="w-3 h-3" /> Изменить
              </button>
              <button onClick={() => handleToggleActive(plan)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg',
                  plan.isActive
                    ? 'border border-slate-200 hover:bg-slate-50 text-slate-600'
                    : 'bg-green-50 border border-green-200 text-green-700')}>
                {plan.isActive ? <><Trash2 className="w-3 h-3" /> Скрыть</> : <><Check className="w-3 h-3" /> Показать</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Subscriptions Panel ───────────────────────────────────────────────────────

function SubscriptionsPanel() {
  const [subs, setSubs]       = useState<DBSubscription[]>([])
  const [plans, setPlans]     = useState<DBPlan[]>([])
  const [users, setUsers]     = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // form state
  const [fUserId, setFUserId]     = useState('')
  const [fPlanId, setFPlanId]     = useState('')
  const [fStatus, setFStatus]     = useState('active')
  const [fExpires, setFExpires]   = useState('')
  const [fNotes, setFNotes]       = useState('')
  const [saving, setSaving]       = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      billingApi.getSubscriptions(),
      plansApi.listAll(),
      adminApi.listUsers(),
    ])
      .then(([s, p, u]) => { setSubs(s.subscriptions); setPlans(p.plans); setUsers(u.users) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async () => {
    if (!fUserId || !fPlanId || !fExpires) return
    setSaving(true)
    try {
      await billingApi.createSubscription({
        userId: fUserId, planId: fPlanId, status: fStatus,
        expiresAt: new Date(fExpires).toISOString(),
        notes: fNotes || undefined,
      })
      setShowForm(false)
      setFUserId(''); setFPlanId(''); setFExpires(''); setFNotes('')
      load()
    } finally { setSaving(false) }
  }

  const handleStatus = async (id: string, status: string) => {
    await billingApi.updateSubscription(id, { status })
    load()
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Подписки</h3>
          <p className="text-sm text-slate-500">Управление Premium доступом пользователей</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Выдать подписку
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h4 className="font-medium text-slate-800">Новая подписка</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Пользователь</label>
              <select value={fUserId} onChange={e => setFUserId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="">— выберите —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Тариф</label>
              <select value={fPlanId} onChange={e => setFPlanId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="">— выберите —</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {fmt(p.price)} ₸/{periodLabel[p.period]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Статус</label>
              <select value={fStatus} onChange={e => setFStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="active">Активна</option>
                <option value="trial">Пробная</option>
                <option value="cancelled">Отменена</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Действует до</label>
              <input type="date" value={fExpires} onChange={e => setFExpires(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Заметки</label>
            <input value={fNotes} onChange={e => setFNotes(e.target.value)}
              placeholder="Оплата Kaspi #123..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving || !fUserId || !fPlanId || !fExpires}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Создать
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {subs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Подписок пока нет</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Пользователь', 'Тариф', 'Статус', 'Действует до', 'Заметки', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{s.user.name}</p>
                    <p className="text-xs text-slate-400">{s.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.plan.name}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColor[s.status] ?? 'bg-slate-100 text-slate-500')}>
                      {statusRu[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(s.expiresAt)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{s.notes ?? '—'}</td>
                  <td className="px-4 py-3">
                    {s.status === 'active' && (
                      <button onClick={() => handleStatus(s.id, 'cancelled')}
                        className="text-xs text-red-500 hover:text-red-700">Отменить</button>
                    )}
                    {(s.status === 'expired' || s.status === 'cancelled') && (
                      <button onClick={() => handleStatus(s.id, 'active')}
                        className="text-xs text-green-600 hover:text-green-800">Активировать</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Payments Panel ────────────────────────────────────────────────────────────

function PaymentsPanel() {
  const [payments, setPayments] = useState<DBPayment[]>([])
  const [totalRevenue, setTotal] = useState(0)
  const [users, setUsers]        = useState<AdminUser[]>([])
  const [loading, setLoading]    = useState(true)
  const [showForm, setShowForm]  = useState(false)

  const [fUserId, setFUserId]   = useState('')
  const [fAmount, setFAmount]   = useState('')
  const [fMethod, setFMethod]   = useState('kaspi')
  const [fStatus, setFStatus]   = useState('success')
  const [fRef, setFRef]         = useState('')
  const [fNotes, setFNotes]     = useState('')
  const [saving, setSaving]     = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([billingApi.getPayments(), adminApi.listUsers()])
      .then(([p, u]) => { setPayments(p.payments); setTotal(p.totalRevenue); setUsers(u.users) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async () => {
    if (!fUserId || !fAmount) return
    setSaving(true)
    try {
      await billingApi.createPayment({
        userId: fUserId, amount: parseInt(fAmount) || 0,
        method: fMethod, status: fStatus,
        reference: fRef || undefined, notes: fNotes || undefined,
      })
      setShowForm(false)
      setFUserId(''); setFAmount(''); setFRef(''); setFNotes('')
      load()
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Платежи</h3>
          <p className="text-sm text-slate-500">Общий доход: <span className="font-semibold text-green-600">{fmt(totalRevenue)} ₸</span></p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm hover:bg-primary-700">
          <Plus className="w-4 h-4" /> Записать оплату
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h4 className="font-medium text-slate-800">Новая запись об оплате</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Пользователь</label>
              <select value={fUserId} onChange={e => setFUserId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="">— выберите —</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Сумма (₸)</label>
              <input value={fAmount} onChange={e => setFAmount(e.target.value)} type="number" min={0}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Способ оплаты</label>
              <select value={fMethod} onChange={e => setFMethod(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="kaspi">Kaspi Pay</option>
                <option value="transfer">Банковский перевод</option>
                <option value="cash">Наличные</option>
                <option value="manual">Вручную</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Статус</label>
              <select value={fStatus} onChange={e => setFStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="success">Оплачено</option>
                <option value="pending">Ожидание</option>
                <option value="failed">Ошибка</option>
                <option value="refunded">Возврат</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Номер транзакции / реф.</label>
              <input value={fRef} onChange={e => setFRef(e.target.value)} placeholder="KAS-12345"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Заметки</label>
              <input value={fNotes} onChange={e => setFNotes(e.target.value)} placeholder="Доп. информация"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving || !fUserId || !fAmount}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Записать
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Платежей пока нет</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Пользователь', 'Тариф', 'Сумма', 'Способ', 'Статус', 'Реф.', 'Дата'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{p.user.name}</p>
                    <p className="text-xs text-slate-400">{p.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.subscription?.plan?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{fmt(p.amount)} ₸</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{p.method}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColor[p.status] ?? 'bg-slate-100 text-slate-500')}>
                      {statusRu[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{p.reference ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Contracts Panel ───────────────────────────────────────────────────────────

function ContractsPanel() {
  const [type, setType] = useState<'b2c' | 'b2b'>('b2c')

  const b2c = `ДОГОВОР-ОФЕРТА

Публичная оферта на оказание услуг доступа к образовательной платформе StudyHub

1. ОБЩИЕ ПОЛОЖЕНИЯ
1.1. ТОО «StudyHub KZ» (далее — «Исполнитель») предлагает неограниченному кругу физических лиц (далее — «Пользователь») заключить настоящий Договор-оферту на условиях, изложенных ниже.
1.2. Акцептом настоящей оферты является оплата выбранного тарифного плана через платёжные системы, доступные на платформе.

2. ПРЕДМЕТ ДОГОВОРА
2.1. Исполнитель предоставляет Пользователю доступ к образовательной платформе StudyHub на период действия оплаченного тарифного плана.
2.2. Платформа включает: образовательные материалы по подготовке к ЕНТ и IELTS, AI-ментора, пробные тесты, учебные планы.

3. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ
3.1. Стоимость тарифных планов указана на странице /pricing платформы.
3.2. Оплата производится единовременно за выбранный период (месяц/год).
3.3. Исполнитель вправе изменять стоимость тарифов. Действующая цена применяется к новым подпискам.

4. СРОК ДЕЙСТВИЯ И РАСТОРЖЕНИЕ
4.1. Договор вступает в силу с момента акцепта и действует до истечения оплаченного периода.
4.2. Пользователь вправе отказаться от услуг в любой момент без штрафных санкций.
4.3. Возврат средств производится за неиспользованный период при обращении в течение 30 дней с момента оплаты.

5. ПРАВА И ОБЯЗАННОСТИ СТОРОН
5.1. Исполнитель обязуется обеспечить доступ к платформе 24/7, за исключением плановых технических работ.
5.2. Пользователь обязуется не передавать доступ третьим лицам и не нарушать авторские права на материалы платформы.

6. ПЕРСОНАЛЬНЫЕ ДАННЫЕ
6.1. Оплачивая услуги, Пользователь даёт согласие на обработку персональных данных согласно Политике конфиденциальности.

7. ОТВЕТСТВЕННОСТЬ
7.1. Исполнитель не несёт ответственности за результаты сдачи ЕНТ/IELTS Пользователем.

8. РЕКВИЗИТЫ ИСПОЛНИТЕЛЯ
ТОО «StudyHub KZ»
БИН: _______________
Адрес: г. Алматы, ________________
Email: support@studyhub.kz`

  const b2b = `ДОГОВОР НА ОКАЗАНИЕ ОБРАЗОВАТЕЛЬНЫХ УСЛУГ (B2B)
№ _______ от «___» __________ 202__ г.

г. Алматы

ТОО «StudyHub KZ» (далее — «Исполнитель»), в лице директора _____________________, действующего на основании Устава, с одной стороны, и

____________________________________________ (далее — «Заказчик»), в лице ___________________________, действующего на основании ________________________, с другой стороны, совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА
1.1. Исполнитель обязуется предоставить Заказчику доступ к образовательной платформе StudyHub для использования сотрудниками/учениками Заказчика в количестве _______ лицензий.
1.2. Срок действия лицензий: с «___» ________ 202__ г. по «___» ________ 202__ г.

2. СТОИМОСТЬ И ПОРЯДОК РАСЧЁТОВ
2.1. Стоимость услуг составляет: _____________ (________________) тенге, в т.ч. НДС/без НДС.
2.2. Оплата производится в течение 5 (пяти) банковских дней после подписания Акта об оказании услуг.
2.3. Реквизиты для оплаты: ИИК _______________, БИК _______________, Банк _______________.

3. ПОРЯДОК СДАЧИ-ПРИЁМКИ УСЛУГ
3.1. По истечении каждого месяца Исполнитель направляет Акт об оказании услуг.
3.2. Заказчик обязан подписать Акт или направить мотивированный отказ в течение 3 рабочих дней.

4. ПРАВА И ОБЯЗАННОСТИ СТОРОН
4.1. Исполнитель обеспечивает доступ к платформе, техническую поддержку и обновление материалов.
4.2. Заказчик обеспечивает использование платформы исключительно в образовательных целях.

5. КОНФИДЕНЦИАЛЬНОСТЬ
5.1. Стороны обязуются не разглашать конфиденциальную информацию третьим лицам.

6. ОТВЕТСТВЕННОСТЬ СТОРОН
6.1. В случае нарушения сроков оплаты Заказчик уплачивает пеню в размере 0,1% от суммы задолженности за каждый день просрочки.

7. СРОК ДЕЙСТВИЯ ДОГОВОРА
7.1. Договор вступает в силу с момента подписания и действует до полного исполнения Сторонами своих обязательств.

8. РЕКВИЗИТЫ СТОРОН

ИСПОЛНИТЕЛЬ:                          ЗАКАЗЧИК:
ТОО «StudyHub KZ»                     ________________________
БИН: _______________                  БИН: _______________
ИИК: _______________                  ИИК: _______________
Банк: ______________                  Банк: ______________

_____________________ / _______        _____________________ / _______
   (ФИО)            (подпись)             (ФИО)            (подпись)`

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-800">Шаблоны договоров</h3>
        <p className="text-sm text-slate-500">Скопируйте шаблон и заполните реквизиты</p>
      </div>

      <div className="flex gap-2">
        {(['b2c', 'b2b'] as const).map(t => (
          <button key={t} onClick={() => setType(t)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              type === t ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')}>
            {t === 'b2c' ? 'B2C — Договор-оферта' : 'B2B — Договор с юр. лицом'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-slate-800">
            {type === 'b2c' ? 'Публичная оферта (B2C)' : 'Договор с организацией (B2B)'}
          </h4>
          <button onClick={() => copy(type === 'b2c' ? b2c : b2b)}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
            <FileText className="w-4 h-4" /> Копировать текст
          </button>
        </div>
        <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 p-4 rounded-xl max-h-[500px] overflow-y-auto">
          {type === 'b2c' ? b2c : b2b}
        </pre>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Важно:</strong> это шаблоны для ознакомления. Перед использованием проконсультируйтесь с юристом и заполните реквизиты вашего ТОО.
      </div>
    </div>
  )
}

// ── Billing Stats Row ─────────────────────────────────────────────────────────

function BillingStatsRow() {
  const [stats, setStats] = useState<BillingStats | null>(null)

  useEffect(() => {
    billingApi.getStats().then(setStats).catch(() => {})
  }, [])

  if (!stats) return null

  const cards = [
    { label: 'Общий доход', value: `${fmt(stats.totalRevenue)} ₸`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Доход за месяц', value: `${fmt(stats.monthRevenue)} ₸`, icon: CreditCard, color: 'bg-blue-500' },
    { label: 'Активных подписок', value: stats.activeSubscriptions, icon: Crown, color: 'bg-purple-500' },
    { label: 'Всего подписок', value: stats.totalSubscriptions, icon: Users, color: 'bg-amber-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-white', c.color)}>
            <c.icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main BillingPanel ─────────────────────────────────────────────────────────

type BillingTab = 'plans' | 'subscriptions' | 'payments' | 'contracts'

export default function BillingPanel() {
  const [tab, setTab] = useState<BillingTab>('plans')

  const tabs: { id: BillingTab; label: string; icon: React.ElementType }[] = [
    { id: 'plans',         label: 'Тарифы',     icon: Star },
    { id: 'subscriptions', label: 'Подписки',   icon: Crown },
    { id: 'payments',      label: 'Платежи',    icon: CreditCard },
    { id: 'contracts',     label: 'Договора',   icon: FileText },
  ]

  return (
    <div className="space-y-6">
      <BillingStatsRow />

      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
        <button onClick={() => window.location.reload()}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-600">
          <RefreshCw className="w-3.5 h-3.5" /> Обновить
        </button>
      </div>

      {tab === 'plans'         && <PlansPanel />}
      {tab === 'subscriptions' && <SubscriptionsPanel />}
      {tab === 'payments'      && <PaymentsPanel />}
      {tab === 'contracts'     && <ContractsPanel />}
    </div>
  )
}
