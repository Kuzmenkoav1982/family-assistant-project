# Платформенные треки

> Кросс-секционные треки (затрагивают весь app shell / auth / admin).
> Не путать с продуктовыми вертикалями (см. `docs/development/R2_MASTERPLAN.md`).

---

## Активные треки

| Трек | Назначение | Статус | Где смотреть |
|---|---|---|---|
| **Status Banner v1** | Управляемый верхний баннер (info/maintenance/warning/critical/update) + админ-пульт + rule-based AI suggestions | 🔒 **Frozen** (commit `faf8e5c`, 2026-05-19) | `docs/status-banner/STATUS_BANNER_V1_FREEZE.md` |
| **Security Mini-Sprint** | Route access audit, ProtectedRoute coverage, AdminRoute hardening, dev/debug hygiene, auth verification foundation | 🟢 **Active** | `docs/security/` (создаётся в этом треке) |

---

## Очередь

1. **Security Mini-Sprint** — сейчас.
2. **Family Knowledge Discovery** — после security. Это **discovery**, не build (контент-аудит, таксономия, RAG inventory, IA-map).

---

## Заметки о Status Banner v1 после freeze

- Любая работа — только через follow-up тикеты (`docs/status-banner/FOLLOW_UPS.md`).
- Особо важный follow-up: снять `audience_policy: "all_only_v1"` — это часть SEC-1.5 (auth verification foundation).
