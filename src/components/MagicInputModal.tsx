"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, X, TrendingDown, TrendingUp, Camera, Image as ImageIcon, Loader2, Trash2, CheckCircle2, Check } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useFinance } from '@/lib/store';

interface DetectedTx {
  id: string;
  amount: number;
  category: string;
  accountName: string;
  accountId?: string;
  title: string;
  type: 'Expense' | 'Income';
  selected: boolean;
}

interface MagicInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { amount: number, category: string, accountName: string, type: 'Expense' | 'Income', accountId?: string }) => void;
}

// ЖЕСТКИЙ СЛОВАРЬ СИНОНИМОВ И ОПЕЧАТОК
const KEYWORD_MAPS = {
  categories: [
    { label: 'Продукты', keywords: ['пятерочка', 'петя', 'магнит', 'перекресток', 'перекрест', 'вкусвилл', 'вкус вил', 'азбука', 'метро', 'лента', 'продукты', 'маркет', 'дикси', 'ашан', 'окей', 'спар', 'spar', 'самокат', 'лавка', 'чижик', 'верный', 'глобус', 'еда из магазина', 'магазин', 'супермаркет'] },
    { label: 'Еда и кафе', keywords: ['теремок', 'терем', 'бургер', 'мак', 'макдоналдс', 'kfc', 'кфс', 'ростикс', 'вкусно', 'еда', 'ужин', 'обед', 'завтрак', 'сэндвич', 'сендвич', 'шаурма', 'шаверма', 'пицца', 'суши', 'ресторан', 'додо', 'dodo', 'тануки', 'якитория', 'шоколадница', 'му-му', 'бургер кинг', 'бк', 'столовая', 'бистро', 'гриль', 'кафе', 'кафешка'] },
    { label: 'Кофейни', keywords: ['серф', 'surf', 'кофе', 'капучино', 'латте', 'бариста', 'эклер', 'старбакс', 'starbucks', 'кофейня', 'кофемания', 'даблби', 'doubleb', 'кофе с собой', 'coffee', 'skuratov', 'скуратов'] },
    { label: 'Транспорт', keywords: ['такси', 'яндекс', 'убер', 'uber', 'метро', 'автобус', 'самокат', 'бензин', 'заправка', 'лукойл', 'роснефть', 'газпром нефть', 'татнефть', 'shell', 'делимобиль', 'belka', 'белка', 'тройка', 'стрелка', 'подорожник', 'электричка', 'ржд', 'билет', 'парковка', 'платная дорога'] },
    { label: 'Маркетплейсы', keywords: ['wildberries', 'вб', 'wb', 'ozon', 'озон', 'али', 'ali', 'aliexpress', 'маркет', 'яндекс маркет', 'мегамаркет', 'сбермегамаркет', 'купер'] },
    { label: 'Шопинг', keywords: ['одежда', 'кроссовки', 'nike', 'adidas', 'zara', 'зара', 'hm', 'lamoda', 'ламода', 'шопинг', 'обувь', 'платье', 'джинсы', 'uniqlo', 'юникло', 'befree', 'love republic', 'maag'] },
    { label: 'Дом и ремонт', keywords: ['леруа', 'leroy', 'петрович', 'икеа', 'ikea', 'hoff', 'хофф', 'мебель', 'ремонт', 'стройматериалы', 'цветы', 'дом', 'хозяйственные', 'бытовая химия'] },
    { label: 'Техника', keywords: ['мвидео', 'эльдорадо', 'dns', 'днс', 'ситилинк', 're-store', 'iphone', 'телефон', 'ноутбук', 'техника', 'компьютер', 'гаджеты'] },
    { label: 'Здоровье', keywords: ['аптека', 'врач', 'стоматолог', 'анализы', 'витамины', 'здоровье', 'ригла', 'горздрав', 'инвитро', 'гемотест', 'клиника', 'лекарства', 'медицина'] },
    { label: 'Досуг', keywords: ['кино', 'театр', 'музей', 'игра', 'подписка', 'нетфликс', 'netflix', 'иви', 'парк', 'развлечения', 'билеты', 'концерт', 'клуб', 'бар', 'steam', 'стим', 'playstation', 'ps store', 'xbox', 'кинопоиск'] },
    { label: 'Услуги и связь', keywords: ['мтс', 'билайн', 'мегафон', 'теле2', 'интернет', 'телефон', 'связь', 'жкх', 'квартплата', 'свет', 'газ', 'вода', 'ростелеком', 'домру', 'налоги', 'штраф', 'госуслуги'] },
    { label: 'Красота', keywords: ['салон', 'стрижка', 'барбер', 'золотое яблоко', 'рив гош', 'лэтуаль', 'косметика', 'парфюм', 'маникюр', 'красота', 'уход'] },
    { label: 'Доходы', keywords: ['зарплата', 'премия', 'бонус', 'аванс', 'кэшбэк', 'доход', 'перевод от', 'подарок', 'дивиденды', 'возврат', 'salary', 'начисления'] }
  ],
  accounts: [
    { label: 'Сбербанк', keywords: ['сбор', 'сбер', 'сбербанк', 'sber', 'сбол', 'сбербанк онлайн', 'sb-ol'] },
    { label: 'Т-Банк', keywords: ['т банк', 'т-банк', 'тинькофф', 'тиньк', 'tinkoff', 'тбанк', 'т-финанс', 't-bank', 't bank', 'tbank'] },
    { label: 'Альфа-Банк', keywords: ['альфа', 'alfa', 'а-банк', 'альф', 'alfabank'] },
    { label: 'ВТБ', keywords: ['втб', 'vtb', 'втб онлайн'] },
    { label: 'Газпромбанк', keywords: ['гпб', 'газпром', 'gazprom', 'газпромбанк'] },
    { label: 'Райффайзен', keywords: ['райф', 'raif', 'раф', 'raiffeisen'] },
    { label: 'Озон Банк', keywords: ['озон банк', 'ozon bank', 'озон карта', 'озон'] },
    { label: 'Яндекс Банк', keywords: ['яндекс банк', 'yandex bank', 'я-карта', 'плюс банк', 'ядекс'] },
    { label: 'Совкомбанк', keywords: ['совкомбанк', 'совком', 'халва', 'halva', 'sovcom'] },
    { label: 'ВБ Банк', keywords: ['вб банк', 'wb bank', 'вайлдберриз банк', 'wildberries банк', 'wb'] },
    { label: 'Почта Банк', keywords: ['почта банк', 'почта'] },
    { label: 'Наличные', keywords: ['нал', 'наличные', 'кэш', 'cash', 'кошелек', 'кармане', 'карман'] }
  ]
};

export function MagicInputModal({ isOpen, onClose, onAdd }: MagicInputModalProps) {
  const { accounts } = useFinance();
  const [input, setInput] = useState('');
  const [type, setType] = useState<'Expense' | 'Income'>('Expense');
  const [detectedList, setDetectedList] = useState<DetectedTx[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseMultiContent = (text: string) => {
    const parts = text.split(/[\n,]+/).map(p => p.trim()).filter(p => p.length > 2);
    const results: DetectedTx[] = [];
    
    parts.forEach((part) => {
      const val = part.toLowerCase();
      // Улучшенный поиск суммы: поддержка точек и запятых (напр. 1500.50 или 1500,50)
      const amountMatch = val.replace(/\s/g, '').replace(',', '.').match(/(\d{1,7}(?:\.\d{1,2})?)/);
      
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1]);
        if (amount > 2000000 || amount < 1) return; // Фильтр нереальных сумм

        let category = type === 'Expense' ? 'Прочее' : 'Доход';
        for (const item of KEYWORD_MAPS.categories) {
          if (item.keywords.some(k => val.includes(k))) {
            category = item.label;
            break;
          }
        }

        let accountName = 'Основной счет';
        let accountId = undefined;

        let detectedBankLabel = '';
        for (const item of KEYWORD_MAPS.accounts) {
          if (item.keywords.some(k => val.includes(k))) {
            detectedBankLabel = item.label;
            break;
          }
        }

        const matchedAcc = accounts.find(a => 
          a.name.toLowerCase().includes(detectedBankLabel.toLowerCase()) ||
          (detectedBankLabel && a.bankName?.toLowerCase().includes(detectedBankLabel.toLowerCase()))
        );

        if (matchedAcc) {
          accountName = matchedAcc.name;
          accountId = matchedAcc.id;
        } else if (accounts.length > 0) {
          accountName = accounts[0].name;
          accountId = accounts[0].id;
        }

        results.push({
          id: Math.random().toString(36).substr(2, 9),
          amount,
          category,
          accountName,
          accountId,
          title: part.substring(0, 30),
          type: type,
          selected: true
        });
      }
    });

    return results;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.includes(',') || val.includes('\n') || val.length > 15) {
      const list = parseMultiContent(val);
      if (list.length > 0) setDetectedList(list);
    } else if (val.length === 0) {
      setDetectedList([]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'rus+eng', { 
        logger: m => m.status === 'recognizing text' && setProgress(Math.round(m.progress * 100))
      });
      const list = parseMultiContent(text);
      setDetectedList(list);
      if (list.length > 0) setInput(`Распознано: ${list.length} опер.`);
    } catch (error) {
      alert("Ошибка OCR");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelect = (id: string) => {
    setDetectedList(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const removeTx = (id: string) => {
    setDetectedList(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveSelected = () => {
    const selectedTxs = detectedList.filter(t => t.selected);
    selectedTxs.forEach(tx => {
      onAdd({
        amount: tx.amount,
        category: tx.category,
        accountName: tx.accountName,
        accountId: tx.accountId,
        type: tx.type
      });
    });
    setDetectedList([]);
    setInput('');
    onClose();
  };

  const selectedCount = detectedList.filter(t => t.selected).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-20 pt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="w-full max-w-md bg-[#1A1C23] border border-[#2E323E] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}>
            
            <div className="flex p-1 bg-[#2E323E] rounded-xl mb-6 flex-shrink-0">
              <button onClick={() => setType('Expense')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${type === 'Expense' ? 'bg-[#1A1C23] text-white' : 'text-gray-500'}`}>
                <TrendingDown className="w-4 h-4" /> Расход
              </button>
              <button onClick={() => setType('Income')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${type === 'Income' ? 'bg-[#1A1C23] text-success' : 'text-gray-500'}`}>
                <TrendingUp className="w-4 h-4" /> Доход
              </button>
            </div>

            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Sparkles className="w-5 h-5" />
                <span>Smart Neural Input</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full bg-[#2E323E]/50 hover:bg-primary/20 hover:text-primary transition-all">
                  <Camera className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 rounded-full bg-[#2E323E]/50 hover:bg-[#2E323E] transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>

            <div className="flex-shrink-0 mb-4">
              <div className="relative">
                <input
                  autoFocus type="text" value={input} onChange={handleInput}
                  placeholder={isProcessing ? `Анализ: ${progress}%` : "1500 кофе, 800 такси..."}
                  disabled={isProcessing}
                  className="w-full bg-transparent text-xl text-white placeholder-gray-600 outline-none border-b border-[#2E323E] pb-2 focus:border-primary transition-colors disabled:opacity-50"
                />
                {isProcessing && <Loader2 className="absolute right-0 top-1 w-5 h-5 text-primary animate-spin" />}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 mb-6 pr-1 custom-scrollbar">
              {detectedList.length === 0 && !isProcessing && (
                <div className="text-center py-10 text-gray-600 text-sm">
                  Введите траты через запятую или загрузите фото
                </div>
              )}
              
              <AnimatePresence initial={false}>
                {detectedList.map((tx) => (
                  <SwipeableItem key={tx.id} tx={tx} onToggle={() => toggleSelect(tx.id)} onDelete={() => removeTx(tx.id)} />
                ))}
              </AnimatePresence>
            </div>

            <button onClick={handleSaveSelected} disabled={selectedCount === 0 || isProcessing} className="w-full flex-shrink-0 bg-primary disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
              {selectedCount > 0 ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Записать ({selectedCount})
                </>
              ) : (
                "Введите данные"
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SwipeableItem({ tx, onToggle, onDelete }: { tx: DetectedTx, onToggle: () => void, onDelete: () => void }) {
  const x = useMotionValue(0);
  const bgColor = useTransform(x, [-100, 0], ["#ef4444", "#2E323E00"]);

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: -100 }} className="relative overflow-hidden rounded-2xl">
      <motion.div style={{ backgroundColor: bgColor }} className="absolute inset-0 flex items-center justify-end px-6 text-white">
        <Trash2 className="w-5 h-5" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) onDelete();
        }}
        onClick={(e) => {
          if (x.get() > -10) onToggle();
        }}
        className={`relative z-10 bg-[#1A1C23] border p-4 flex justify-between items-center cursor-pointer transition-all duration-200 ${tx.selected ? 'border-primary bg-primary/5' : 'border-[#2E323E] opacity-40'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${tx.selected ? 'bg-primary border-primary' : 'border-[#2E323E]'}`}>
            {tx.selected && <Check className="w-4 h-4 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-white">{tx.amount.toLocaleString()} ₽</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${tx.type === 'Expense' ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>{tx.type === 'Expense' ? 'Расход' : 'Доход'}</span>
            </div>
            <div className="flex gap-2 text-[10px] text-gray-400 font-medium">
              <span className="bg-white/5 px-2 py-0.5 rounded-full">{tx.category}</span>
              <span className="text-primary">{tx.accountName}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
