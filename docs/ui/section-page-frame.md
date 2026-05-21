# SectionPageFrame

`SectionPageFrame` — канонический page shell для страниц платформы.

## Статус

- **Active**
- Replaces legacy `SectionHero`
- После W4+W5 является единственным page shell в кодовой базе

## Базовые правила

- Для новых страниц использовать `SectionPageFrame`
- Не создавать новые локальные page-shell обёртки без отдельной причины
- Не возвращать legacy `SectionHero`
- Не дублировать width/layout-логику внешними контейнерами без необходимости

## Width

### `standard`
Дефолтный выбор для большинства страниц.

### `narrow`
Использовать для:
- форм
- текстовых сценариев
- страниц, где важна читаемость и более узкая колонка

### `wide`
Использовать для:
- плотных data-heavy layout
- dashboard / table / grid сценариев
- страниц, которым реально нужна расширенная рабочая область

## Variant

### `light`
Дефолтный рабочий вариант для обычных продуктовых страниц.

### `hero`
Использовать только там, где нужен усиленный верхний блок страницы:
- обзорные / entry страницы
- эмоционально важные продуктовые контуры
- страницы, где hero-подача действительно часть UX

## Anti-patterns

- отдельный legacy hero-wrapper поверх `SectionPageFrame`
- ручное переопределение ширины через дополнительные outer containers без причины
- page-specific shell, если задача решается существующими props
- возврат к `SectionHero` или его re-export

## Migration note

Миграция `SectionHero → SectionPageFrame` завершена в W4+W5.
Legacy `SectionHero` удалён из кодовой базы.
Финальный архивный билд: `d95bd59`.

## Example

```tsx
import { SectionPageFrame } from "@/components/section-page-frame";

export default function ExamplePage() {
  return (
    <SectionPageFrame
      title="Название страницы"
      description="Короткое описание"
      width="standard"
      variant="light"
    >
      <div>Контент страницы</div>
    </SectionPageFrame>
  );
}
```
