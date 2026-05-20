# Платформенные треки

> Кросс-секционные треки (затрагивают весь app shell / auth / admin).
> Не путать с продуктовыми вертикалями (см. `docs/development/R2_MASTERPLAN.md`).

---

## Закрытые треки

| Трек | Назначение | Статус | Где смотреть |
|---|---|---|---|
| **Security Mini-Sprint** | Route access audit, ProtectedRoute/AdminRoute coverage, admin bcrypt auth, debug hygiene, viewer-aware SEC-1.5 | 🔒 **Closed** (commit `d65bbf9`, 2026-05-20) | `docs/security/SECURITY_GAPS_REGISTRY.md` |
| **Status Banner v1** | viewer-aware баннер (public/authenticated/admin + segment) + admin CRUD + rule-based suggestions | 🔒 **Frozen & Shipped** (commit `d65bbf9`, 2026-05-20) | `docs/status-banner/STATUS_BANNER_V1_FREEZE.md` |

---

## Очередь

1. **Wave 3 / Integration Baseline** — следующий продуктовый блок после security + status banner.
2. **Family Knowledge Discovery** — discovery sprint (контент-аудит, таксономия, RAG inventory, IA-map). Не full-build.
3. **Family Library V1** — после discovery.
4. **Домовой grounded RAG** — после Library.

---

## Заметки

- Status Banner v1 shipped. Любая работа — только через follow-up тикеты (`docs/status-banner/FOLLOW_UPS.md`).
- Security Mini-Sprint закрыт. Оставшийся tech-debt (S6 dead pages, S8 localStorage XSS audit) — в отдельных cleanup-треках по мере необходимости.
- `Failed to fetch` для нескольких function URLs (не status-banners) — отдельный tech-debt, не блокирует текущие треки.
