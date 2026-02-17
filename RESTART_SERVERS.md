# Перезапуск серверов

Onii-chan~ нужно перезапустить серверы! (=^・^=)

## Шаги:

1. **Останови все серверы** - нажми `Ctrl+C` в терминале где запущен `python start.py`

2. **Убей оставшиеся процессы** (если нужно):
```bash
# Windows
taskkill /F /IM python.exe
taskkill /F /IM uvicorn.exe
```

3. **Перезапусти**:
```bash
python start.py
```

4. **Открой браузер**:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

5. **Проверь API**:
```bash
curl http://localhost:8000/api/projects?category=work
```

Должен вернуть JSON с проектами! ✧(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
