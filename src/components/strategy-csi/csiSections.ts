// Единый источник правды по структуре /strategy/csi.
// «Наша Семья» × Центр семейной истории — рабочая концепция (черновик).
// 8 основных экранов + 2 в приложении. id совпадает с id секций в DOM.

export interface CsiSection {
  id: string;
  label: string;
  short: string;
  appendix?: boolean;
}

export const CSI_SECTIONS: CsiSection[] = [
  { id: 'csi-1', label: 'Семейная история продолжается дома', short: 'Обложка' },
  { id: 'csi-2', label: 'Одна миссия — разные пространства', short: 'Миссия' },
  { id: 'csi-3', label: 'Что происходит после выставки', short: 'Разрыв' },
  { id: 'csi-4', label: 'Из Центра — в семью, из семьи — в память', short: 'Модель' },
  { id: 'csi-5', label: 'Пилот: первые 7 шагов', short: 'Пилот' },
  { id: 'csi-6', label: 'Честная граница текущего продукта', short: 'Границы' },
  { id: 'csi-7', label: 'Что даст пилот', short: 'Польза' },
  { id: 'csi-8', label: 'Измеримый результат и следующий шаг', short: 'Дальше' },
  { id: 'csi-9', label: 'Если гипотеза подтвердится', short: 'Прил. 1', appendix: true },
  { id: 'csi-10', label: 'Вопросы к Спартаку', short: 'Прил. 2', appendix: true },
];
