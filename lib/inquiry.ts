export const destinations = ['Подскажите страну', 'Корея', 'ОАЭ', 'Европа', 'США'] as const;
export const budgets = ['Нужна консультация', 'До 2 млн ₽', '2–3 млн ₽', '3–5 млн ₽', '5–8 млн ₽', 'От 8 млн ₽'] as const;
export type Inquiry = { kind: string; model: string; budget: string; city: string; country: string };
export const initialInquiry: Inquiry = { kind: 'Автомобиль', model: '', budget: budgets[0], city: '', country: destinations[0] };
export function validateInquiry(value: unknown): Inquiry {
 if (!value || typeof value !== 'object') throw new Error('Укажите параметры запроса.');
 const v = value as Record<string, unknown>;
 for (const key of ['kind', 'model', 'budget', 'city', 'country']) if (typeof v[key] !== 'string') throw new Error('Параметры должны быть текстом.');
 if (!['Автомобиль', 'Спецтехника', 'Оформление'].includes(v.kind as string)) throw new Error('Выберите направление.');
 if (!(budgets as readonly string[]).includes(v.budget as string) || !(destinations as readonly string[]).includes(v.country as string)) throw new Error('Выберите бюджет и страну из списка.');
 if ((v.model as string).length > 240 || (v.city as string).length > 80) throw new Error('Сократите описание запроса.');
 return {kind:v.kind as string, model:(v.model as string).trim(), budget:v.budget as string, city:(v.city as string).trim(), country:v.country as string};
}
export function buildInquiry(value: unknown) {
 const v=validateInquiry(value);
 return `Ас Саляму алейкум! Хочу обсудить ${v.kind==='Оформление'?'оформление':v.kind==='Спецтехника'?'привоз спецтехники':'привоз автомобиля'} с AutoTried.\n\nМодель / задача: ${v.model || 'Нужна помощь с выбором'}\nБюджет под ключ: ${v.budget}\nСтрана: ${v.country}\nГород получения: ${v.city || 'Уточню в переписке'}\n\nПодскажите варианты, полный состав расходов и срок доставки / оформления.`;
}
