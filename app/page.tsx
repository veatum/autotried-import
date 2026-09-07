'use client';
import { ArrowUpRight, ArrowRight, ArrowLeft, MoveDown, Send, Menu, X, CarFront, Tractor, FileCheck2, Check, Copy, ShieldCheck, Landmark, PackageCheck, Globe2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { initialInquiry, budgets, destinations, buildInquiry, validateInquiry } from '@/lib/inquiry';

const questions = [
 ['Я ещё не выбрал автомобиль. С чего начать?', 'Начните с бюджета под ключ и расскажите, как будете использовать автомобиль: для семьи, города, дальних поездок или бизнеса. Менеджер поможет сузить выбор и сравнить варианты из разных стран.'],
 ['Что входит в расчёт под ключ?', 'Покупка автомобиля, проверка, перевозка, таможенные платежи, применимые сборы, оформление и услуги сопровождения. Конкретные статьи и суммы зависят от автомобиля, маршрута и страны постановки на учёт — запросите подробную смету до оплаты.'],
 ['Почему цена и срок не указаны для каждой машины?', 'Они зависят от конкретного предложения, курса валют, состояния автомобиля, маршрута и оформления. Экономия 30–35% и доставка за 3–4 недели — ориентиры AutoTried, а не универсальное обещание. Условия нужно подтвердить для выбранного автомобиля.'],
 ['Можно заказать только оформление или помощь с оплатой?', 'Да. Можно обратиться отдельно за брокерским сопровождением, помощью с документами, постановкой на учёт или оплатой. Пришлите, где находится автомобиль и какие документы уже есть: менеджер уточнит доступные услуги.'],
 ['Как проходит оплата через банк?', 'Команда помогает согласовать способ оплаты через официальные банки и перечень подтверждающих документов. Доступность платежа, требования банка и валютного контроля проверяются для конкретной сделки.'],
 ['Работаете со спецтехникой и киргизским учётом?', 'Да, в том числе с компактными экскаваторами, погрузчиками и тракторами. Вопросы регистрации в Кыргызстане и покупки по доверенности обсуждаются отдельно: возможность и условия зависят от ситуации и документов.'],
];

function InquiryForm() {
 const [data, setData] = useState(initialInquiry);
 const [ready, setReady] = useState(false);
 const [copied, setCopied] = useState(false);
 const [copyError, setCopyError] = useState(false);
 const message = buildInquiry(data);
 useEffect(()=>{
   type Tool = {name:string;title:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown};
   const context=(document as Document & {modelContext?:{registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>}}).modelContext;
   if (!context?.registerTool) return;
   const controller=new AbortController();
   try { void Promise.resolve(context.registerTool({name:'stage_import_inquiry',title:'Подготовить запрос AutoTried',description:'Подготавливает видимый черновик запроса. Не отправляет сообщение и не открывает Telegram.',inputSchema:{type:'object',properties:{kind:{type:'string',enum:['Автомобиль','Спецтехника','Оформление']},model:{type:'string',maxLength:240},budget:{type:'string',enum:[...budgets]},city:{type:'string',maxLength:80},country:{type:'string',enum:[...destinations]}},required:['kind','model','budget','city','country'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){const next=validateInquiry(input);flushSync(()=>{setData(next);setReady(true);setCopied(false);setCopyError(false);});return {status:'draft_ready',message:buildInquiry(next),sent:false};}}, {signal:controller.signal})).catch(()=>{}); } catch { /* The form works independently of optional WebMCP. */ }
   return ()=>controller.abort();
 },[]);
 async function copy() {try{await navigator.clipboard.writeText(message);setCopied(true);setCopyError(false);}catch{setCopyError(true);}}
 return <div className="inquiry-card">
 <div className="form-top"><span>{ready?'02 / ВАШ ЗАПРОС':'01 / ПАРАМЕТРЫ'}</span><span>Без звонков и регистрации</span></div>
 {!ready ? <form onSubmit={e=>{e.preventDefault();setReady(true);}}>
 <Tabs value={data.kind} onValueChange={value=>setData({...data,kind:String(value)})} className="inquiry-tabs">
 <TabsList className="kind-list" aria-label="Что вас интересует"><TabsTrigger value="Автомобиль"><CarFront/> Авто</TabsTrigger><TabsTrigger value="Спецтехника"><Tractor/> Техника</TabsTrigger><TabsTrigger value="Оформление"><FileCheck2/> Документы</TabsTrigger></TabsList>
 {['Автомобиль','Спецтехника','Оформление'].map(kind=><TabsContent key={kind} value={kind} className="kind-description">{kind==='Автомобиль'?'Новая машина или с пробегом — подберём под вашу задачу.':kind==='Спецтехника'?'Экскаваторы, погрузчики и тракторы для вашего бизнеса.':'Брокерское сопровождение, оплата и оформление.'}</TabsContent>)}
 </Tabs>
 <label className="field" htmlFor="model">{data.kind==='Оформление'?'С чем нужна помощь?':'Модель или ссылка на объявление'}<input id="model" value={data.model} onChange={e=>setData({...data,model:e.target.value})} maxLength={240} placeholder={data.kind==='Спецтехника'?'Например, мини-экскаватор до 3 тонн':data.kind==='Оформление'?'Например, ЭПТС и постановка на учёт':'Например, Kia Sportage от 2022 года'}/></label>
 <div className="form-row"><div className="field"><label id="budget-label">Бюджет под ключ</label><Select value={data.budget} onValueChange={value=>setData({...data,budget:value??budgets[0]})}><SelectTrigger aria-labelledby="budget-label" className="form-select"><SelectValue/></SelectTrigger><SelectContent>{budgets.map(b=><SelectItem key={b} value={b} className="select-option">{b}</SelectItem>)}</SelectContent></Select></div><div className="field"><label id="country-label">Откуда привезти</label><Select value={data.country} onValueChange={value=>setData({...data,country:value??destinations[0]})}><SelectTrigger aria-labelledby="country-label" className="form-select"><SelectValue/></SelectTrigger><SelectContent>{destinations.map(c=><SelectItem key={c} value={c} className="select-option">{c}</SelectItem>)}</SelectContent></Select></div></div>
 <label className="field" htmlFor="city">Город получения<input id="city" value={data.city} onChange={e=>setData({...data,city:e.target.value})} maxLength={80} placeholder="Например, Махачкала" autoComplete="address-level2"/></label>
 <button type="submit" className="button red form-submit">Подготовить запрос на расчёт <ArrowRight size={20}/></button><p className="form-note">Можно не знать модель или бюджет. Оставьте поля пустыми — начнём с консультации.</p>
 </form> : <div className="prepared" role="status"><div className="ready-heading"><span><Check size={20}/></span><h3>Осталось отправить</h3></div><p>Проверьте запрос. Кнопка откроет чат с менеджером — сообщение отправляете вы сами.</p><textarea aria-label="Подготовленный текст запроса" readOnly value={message} rows={9}/><a className="button red form-submit" href={`${manager}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">Открыть чат в Telegram <Send size={19}/></a><div className="prepared-actions"><button type="button" onClick={()=>{setReady(false);setCopied(false);setCopyError(false);}}><ArrowLeft size={16}/> Изменить</button><button type="button" onClick={copy}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Скопировано':'Скопировать текст'}</button></div><p className="form-note">{copyError?'Выделите текст выше и скопируйте вручную.':'Если Telegram не подставил текст, скопируйте его и вставьте в чат.'}</p></div>}
 </div>;
}
const manager = 'https://t.me/autovibe_manager';
export default function Home() {
 const [menu, setMenu] = useState(false);
 const [showMobileContact, setShowMobileContact] = useState(false);
 useEffect(() => {
   const visible = new Set<Element>();
   const observer = new IntersectionObserver(entries => {
     entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
     setShowMobileContact(visible.size === 0);
   }, { threshold: 0 });
   document.querySelectorAll('.hero, .inquiry-card, .final-cta').forEach(el => observer.observe(el));
   return () => observer.disconnect();
 }, []);
 return <>
 <div className="concept">ПРЕДВАРИТЕЛЬНАЯ КОНЦЕПЦИЯ САЙТА <span>AutoTried / 01</span></div>
 <header className="header">
 <a className="brand" href="#" aria-label="AutoTried — на главную"><img className="brand-logo" src="./autotried-logo.png" alt="" width={56} height={56}/><span>AUTO<span className="brand-light">TRIED</span><small>INTERNATIONAL AUTO IMPORT</small></span></a>
 <nav className={menu?'nav open':'nav'} aria-label="Главная навигация"><a href="#directions" onClick={()=>setMenu(false)}>Что привозим</a><a href="#process" onClick={()=>setMenu(false)}>Как работаем</a><a href="#questions" onClick={()=>setMenu(false)}>Вопросы</a></nav>
 <a className="header-contact" href={manager} target="_blank" rel="noreferrer"><Send size={17}/> На связи в Telegram <ArrowUpRight size={17}/></a>
 <button className="menu-toggle" aria-label={menu?'Закрыть меню':'Открыть меню'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
 </header>
 <main>
 <section className="hero" aria-labelledby="hero-title">
 <img className="hero-image" src="./hero-auto.jpg" alt="Серебристый автомобиль у грузового терминала — иллюстрация" fetchPriority="high"/>
 <div className="hero-shade"/>
 <div className="hero-content"><div className="eyebrow light"><span className="pulse-dot"/> КОРЕЯ · ОАЭ · ЕВРОПА · США</div>
 <h1 id="hero-title">Автомобиль<br/>из-за рубежа.<br/><span>Под ключ.</span></h1>
 <p>Подберём, проверим и привезём под ключ.<br className="desktop-break"/> Автомобили и спецтехника с доставкой в РФ и СНГ.</p>
 <a className="button red" href="#estimate">Рассчитать привоз <ArrowUpRight size={22}/></a>
 <span className="hero-note">Уже нашли авто? Пришлите ссылку — начнём с расчёта.</span></div>
 <div className="hero-caption"><span className="micro-cross">+</span><span>ОТ ВЫБОРА АВТО<br/>ДО ВЫДАЧИ КЛЮЧЕЙ</span><a href="#directions" aria-label="Смотреть направления"><MoveDown size={24}/></a></div>
 <span className="image-note">Визуал концепции</span></section>
 <div className="facts"><div><strong>30–35<span>%</span></strong><p>возможная экономия<small>по оценке AutoTried, зависит от авто</small></p></div><div><strong>3–4 <span>недели</span></strong><p>ориентир по доставке<small>точный срок — после выбора маршрута</small></p></div><div><strong>Один <span>контакт</span></strong><p>на всех этапах сделки<small>подбор, оплата, доставка, оформление</small></p></div></div>
 <section className="section estimate" id="estimate"><div className="estimate-copy"><div className="eyebrow">01 / СНАЧАЛА — ПОНЯТНАЯ СТОИМОСТЬ</div><h2>Рассчитаем<br/>привоз<br/><em>вашего авто.</em></h2><p className="lead">Расскажите, что ищете. Менеджер разберёт варианты и подготовит расчёт до вашего города.</p><div className="cost-list"><div><span>01</span> Покупка и проверка <Check size={16}/></div><div><span>02</span> Доставка и таможня <Check size={16}/></div><div><span>03</span> Документы и сопровождение <Check size={16}/></div></div><p className="small-note">Попросите менеджера включить в смету расходы на покупку, доставку и оформление.</p></div><InquiryForm/></section>
 <section className="section directions" id="directions"><div className="section-heading"><div><div className="eyebrow">02 / ЧТО ПРИВОЗИМ</div><h2>Привозим авто<br/><em>и спецтехнику.</em></h2></div><p>От автомобиля на каждый день<br/>до техники, которая работает на вас.</p></div><div className="direction-grid"><article className="direction-card car-card"><div className="card-top"><span>01 / AUTOMOBILES</span><CarFront size={24}/></div><h3>Автомобили<br/>под вашу задачу</h3><p>Седаны, кроссоверы и внедорожники.<br/>Новые и с пробегом.</p><div className="direction-tags"><span>Корея</span><span>ОАЭ</span><span>Европа</span><span>США</span></div><img src="./hero-auto.jpg" alt="Автомобиль — иллюстрация направления импорта" loading="lazy"/><a href="#estimate" className="card-link">Подобрать автомобиль <ArrowUpRight size={22}/></a></article><article className="direction-card equipment-card"><div className="card-top"><span>02 / SPECIAL EQUIPMENT</span><Tractor size={25}/></div><h3>Техника для стройки<br/>и склада</h3><p>Мини-экскаваторы, погрузчики и тракторы.<br/>Под условия вашей работы.</p><div className="direction-tags"><span>Стройка</span><span>Склад</span><span>Хозяйство</span></div><img src="./equipment.jpg" alt="Компактный красный экскаватор — иллюстрация направления" loading="lazy"/><a href={`${manager}?text=${encodeURIComponent('Ас Саляму алейкум! Интересует подбор и привоз спецтехники. Хочу обсудить задачу и бюджет.')}`} target="_blank" rel="noreferrer" className="card-link">Обсудить спецтехнику <ArrowUpRight size={22}/></a></article></div><p className="visual-disclaimer">Изображения иллюстративные. Наличие, комплектация и цена определяются при подборе.</p></section>
 <section className="section process" id="process"><div className="section-heading"><div><div className="eyebrow light">03 / ВЕСЬ ПУТЬ — С AUTOTRIED</div><h2>Вы выбираете.<br/>Мы ведём <em>сделку.</em></h2></div><a href={manager} target="_blank" rel="noreferrer" className="text-link">Задать вопрос лично <ArrowUpRight size={19}/></a></div><div className="process-grid">{[
 ['01','Задача и расчёт','Вы рассказываете о машине, бюджете и городе. Обсуждаем варианты и состав расходов.','Вы понимаете стоимость'],
 ['02','Подбор и проверка','Ищем подходящие предложения. Проверяем выбранный автомобиль на месте и обсуждаем результат.','Вы знаете, что покупаете'],
 ['03','Покупка и доставка','Сопровождаем оплату, перевозку и оформление. Согласуем этапы по вашему маршруту.','Вы знаете, что происходит'],
 ['04','Документы и ключи','Помогаем с необходимыми документами и постановкой на учёт. Организуем выдачу автомобиля.','Вы получаете свой автомобиль'],
 ].map(([n,title,text,result])=><article key={n}><span className="step-number">{n}<span/></span><h3>{title}</h3><p>{text}</p><div className="step-result"><Check size={15}/>{result}</div></article>)}</div><div className="route-band"><div><Globe2 size={22}/><span>КОРЕЯ / ОАЭ / ЕВРОПА / США</span></div><span className="route-line"><ArrowRight size={20}/></span><strong>ВАШ ГОРОД В РФ И СНГ</strong></div></section>
 <section className="section services" id="services"><div className="section-heading"><div><div className="eyebrow">04 / НЕ ТОЛЬКО ПРИВОЗ</div><h2>Уже нашли машину?<br/><em>Подключимся дальше.</em></h2></div><p>Можно заказать отдельную услугу.<br/>Расскажите, на каком вы этапе.</p></div><div className="services-grid"><article><ShieldCheck/><span className="service-index">/ 01</span><h3>Таможня<br/>и документы</h3><p>Брокерское сопровождение, вопросы утильсбора, СБКТС и ЭПТС. Состав услуг — под вашу ситуацию.</p><a href={`${manager}?text=${encodeURIComponent('Ас Саляму алейкум! Нужна помощь с таможней и документами на автомобиль.')}`} target="_blank" rel="noreferrer">Обсудить документы <ArrowUpRight size={19}/></a></article><article><Landmark/><span className="service-index">/ 02</span><h3>Помощь<br/>с оплатой</h3><p>Сопровождение платежей через официальные банки с подтверждающими и закрывающими документами.</p><a href={`${manager}?text=${encodeURIComponent('Ас Саляму алейкум! Хочу уточнить условия оплаты автомобиля через банк и перечень документов.')}`} target="_blank" rel="noreferrer">Уточнить условия <ArrowUpRight size={19}/></a></article><article><PackageCheck/><span className="service-index">/ 03</span><h3>Сопровождение<br/>регистрации</h3><p>Помощь с постановкой на учёт в РФ. Регистрация в Кыргызстане и вопросы доверенности — отдельно.</p><a href={`${manager}?text=${encodeURIComponent('Ас Саляму алейкум! Нужна консультация по постановке автомобиля на учёт.')}`} target="_blank" rel="noreferrer">Разобрать мой случай <ArrowUpRight size={19}/></a></article></div><p className="small-note services-note">Возможность, сроки и порядок оформления или платежа подтверждаются после проверки условий сделки и документов. Банковские проверки и требования валютного контроля сохраняются.</p></section>
 <section className="contact-proof"><div><div className="eyebrow light">05 / ДАВАЙТЕ ПОЗНАКОМИМСЯ</div><h2>Познакомьтесь<br/><em>с AutoTried<br/>до покупки.</em></h2></div><div className="contact-proof-right"><p>Задайте вопрос менеджеру, посмотрите публикации и отзывы. Начать можно с обычного разговора о том, какую машину вы ищете.</p><a className="contact-person" href={manager} target="_blank" rel="noreferrer"><span className="telegram-avatar"><Send size={25}/></span><span>Менеджер AutoTried<small>@autovibe_manager</small></span><ArrowUpRight/></a><div className="social-links"><a href="https://t.me/AutoTried_import" target="_blank" rel="noreferrer">Наш канал <ArrowUpRight size={18}/></a><a href="https://t.me/auto_r" target="_blank" rel="noreferrer">Отзывы в Telegram <ArrowUpRight size={18}/></a></div></div></section>
 <section className="section faq" id="questions"><div><div className="eyebrow">06 / ДО ПЕРВОГО СООБЩЕНИЯ</div><h2>Ответим<br/><em>на ваши вопросы.</em></h2><p className="lead">Покупка из другой страны — серьёзное решение. Разберём непонятное до начала сделки.</p></div><Accordion className="faq-list">{questions.map(([q,a],i)=><AccordionItem key={q} value={String(i)}><AccordionTrigger className="faq-question">{q}</AccordionTrigger><AccordionContent className="faq-answer">{a}</AccordionContent></AccordionItem>)}</Accordion></section>
 <section className="final-cta"><span className="cta-watermark" aria-hidden="true">AT↗</span><div className="eyebrow light">ВАШ МАРШРУТ НАЧИНАЕТСЯ С СООБЩЕНИЯ</div><h2>Давайте найдём<br/>ваш следующий <span>авто.</span></h2><a className="button white" href="#estimate">Начать с расчёта <ArrowUpRight size={24}/></a><a className="final-chat" href={manager} target="_blank" rel="noreferrer">Или просто написать менеджеру <ArrowUpRight size={17}/></a></section>
 </main><footer><a className="brand footer-brand" href="#" aria-label="AutoTried — на главную"><img className="brand-logo" src="./autotried-logo.png" alt="" width={44} height={44}/>AUTOTRIED</a><p>Концепция сайта · Условия услуг требуют согласования</p><a href="https://t.me/AutoTried_import" target="_blank" rel="noreferrer">Наш Telegram <ArrowRight size={18}/></a></footer><div className={`mobile-contact${showMobileContact && !menu ? ' is-visible' : ''}`}><a href={manager} target="_blank" rel="noreferrer" aria-label="Написать в Telegram"><Send size={22}/></a><a href="#estimate">Рассчитать привоз <ArrowUpRight size={20}/></a></div>
 </>;
}
