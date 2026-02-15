# ⚡ ЗАПУСК ТЕСТОВ

## Автоматические тесты (командная строка)

```bash
node test-critical-fixes.js
```

## Результаты:

```
🧪 CRITICAL FIXES TEST SUITE
============================================================
✅ PASS: Desktop Canvas - Workspace container created once
✅ PASS: WidgetBase - Deprecated methods have warnings
✅ PASS: Error Boundary - Required files exist
✅ PASS: SimpleDragHover - Memory leak prevention
✅ PASS: SimpleDragHover - Configurable boundary offset
✅ PASS: Widget Error CSS - Proper styling
✅ PASS: Documentation - All files present
✅ PASS: Development Plan - Updated with Phase 1
============================================================

📊 Results: 8 passed, 0 failed
```

## Что проверяется:

1. **Desktop Canvas** - нет дублирования workspace container
2. **WidgetBase** - deprecated методы с warnings
3. **Error Boundary** - файлы существуют и подключены
4. **SimpleDragHover** - WeakMap для предотвращения memory leaks
5. **Configurable Boundary** - options.boundaryOffset работает
6. **CSS Styles** - widget-error.css содержит нужные классы
7. **Documentation** - все MD файлы на месте
8. **Development Plan** - обновлен с Phase 1

## Если тест падает:

```bash
# Проверить конкретный файл
node -e "const fs = require('fs'); console.log(fs.readFileSync('FILENAME', 'utf-8').includes('SEARCH_TEXT'));"

# Пример
node -e "const fs = require('fs'); console.log(fs.readFileSync('index.html', 'utf-8').includes('widget-error.css'));"
```

## Запуск приложения:

```bash
python start.py
# Открыть http://localhost:8080/
```

**Onii-chan~ все тесты прошли! (=^・^=)**
