# ⚡ БЫСТРОЕ ТЕСТИРОВАНИЕ - 2 МИНУТЫ

## 1. Запустить сервер
```bash
python start.py
```

## 2. Открыть тесты
```
http://localhost:8080/test-critical-fixes.html
```

## 3. Нажать все кнопки "Запустить тест"
- Test 1 → ✅ PASS
- Test 2 → ✅ PASS
- Test 3 → ✅ PASS
- Test 4 → ✅ PASS
- Test 5 → ✅ PASS

## 4. Проверить основное приложение
```
http://localhost:8080/
```
- Виджеты работают? ✅
- Нет ошибок в console? ✅
- Drag & drop плавный? ✅

## ✅ Готово!

Все работает - можно коммитить:
```bash
git add .
git commit -m "fix: Phase 1 CRITICAL fixes completed"
```

---

## Если что-то не работает:

### Test 1 FAIL?
→ Проверь `js/features/desktop-canvas/desktop-canvas.js` строки 169-177

### Test 2 FAIL?
→ Проверь `js/entities/widget/widget-base.js` deprecated методы

### Test 3 FAIL?
→ Проверь что `styles/widget-error.css` подключен в `index.html`

### Test 4 FAIL?
→ Проверь `js/shared/lib/simple-drag-hover.js` WeakMap и cleanup

### Test 5 FAIL?
→ Проверь `SimpleDragHover` constructor options

---

**Детали**: Смотри `TESTING_GUIDE.md` и `CRITICAL_FIXES_SUMMARY.md`
