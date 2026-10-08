export const REVIEW_PREFIX = 'owner-review-v1-'
export const TEST_USER_PREFIX = 'review_test_'
export const realUsers = { id: { not: { startsWith: TEST_USER_PREFIX } } }
export const reviewPersonas = [
  { id: 'student-a', role: 'student', name: 'Тестовый ученик A', path: '/ielts-coach', scope: 'IELTS: упражнения, память и диалог' },
  { id: 'student-b', role: 'student', name: 'Тестовый ученик B', path: '/ielts-coach', scope: 'IELTS: отдельный аккаунт для проверки изоляции' },
  { id: 'teacher', role: 'teacher', name: 'Тестовый преподаватель', path: '/teacher', scope: 'Просмотр кабинета; изменения групп пока заблокированы' },
  { id: 'parent', role: 'parent', name: 'Тестовый родитель', path: '/parent', scope: 'Просмотр связанного тестового ученика A' },
  { id: 'center', role: 'teacher', name: 'Владелец тестового центра', path: '/center', scope: 'Просмотр выделенной тестовой организации' },
] as const
export const reviewCatalog = [{
  id: 'skylla-memory-v1', title: 'IELTS: память и продолжение обучения',
  purpose: 'Ученик переносит учебную сводку, продолжает занятия и дорабатывает свои тексты.',
  path: '/ielts-coach', limitation: 'Стартовая текстовая практика. Встроенной записи аудио и полного экзамена пока нет.',
  steps: [
    { id: 'open', title: 'Открыть кабинет', action: 'Запустите ученика A и откройте кабинет IELTS.', expected: 'Четыре вкладки доступны без Premium.', persona: 'student-a' },
    { id: 'import', title: 'Перенести сводку', action: 'В настройках обучения вставьте текст или выберите файл .txt, .md, .json. Укажите следующий шаг Day 8 — Verb Patterns. Проверьте предпросмотр и сохраните.', expected: 'Можно редактировать сводку. Импорт не включает разрешение ИИ автоматически. После сохранения открывается занятие; повторный перенос находится внизу настроек.', persona: 'student-a' },
    { id: 'continue', title: 'Продолжить с нужной темы', action: 'Вернитесь во вкладку Сегодня.', expected: 'Предлагается Day 8. Непустой старый черновик не стирается.', persona: 'student-a' },
    { id: 'draft', title: 'Проверить сохранение', action: 'Напишите вымышленный текст. Дождитесь сохранения, затем обновите страницу.', expected: 'Свой текст восстановлен из аккаунта.', persona: 'student-a' },
    { id: 'feedback', title: 'Получить разбор', action: 'Заполните мини-тест, сохраните работу. Разрешите ИИ в памяти и запросите разбор.', expected: 'Виден ответ Skylla или понятная ошибка. Сохранённая работа не исчезает.', persona: 'student-a' },
    { id: 'revise', title: 'Доработать текст', action: 'Нажмите Доработать, измените текст и сохраните новую попытку.', expected: 'Обе версии доступны. Проверьте понятность объяснения и отсутствие обещанного IELTS band.', persona: 'student-a' },
    { id: 'isolation', title: 'Проверить другого ученика', action: 'Запустите ученика B через панель проверки.', expected: 'Памяти и работ ученика A нет.', persona: 'student-b' },
    { id: 'return', title: 'Вернуться к первому ученику', action: 'Снова запустите ученика A.', expected: 'Его работы и диалог на месте.', persona: 'student-a' },
  ],
}, {
  id: 'roles-preview-v1', title: 'Кабинеты преподавателя, родителя и центра',
  purpose: 'Проверить входы и видимость данных с реальными правами выделенных тестовых аккаунтов.',
  path: '/teacher', limitation: 'Этот сценарий проверяет просмотр. Создание курсов, рассылки и платежи из тестовой сессии отключены.',
  steps: [
    { id: 'teacher', title: 'Преподаватель', action: 'Запустите тестового преподавателя.', expected: 'Доступен кабинет преподавателя, служебные API владельца недоступны.', persona: 'teacher' },
    { id: 'parent', title: 'Родитель', action: 'Запустите тестового родителя.', expected: 'Виден связанный тестовый ученик A; чужих детей нет.', persona: 'parent' },
    { id: 'center', title: 'Центр', action: 'Запустите владельца тестового центра.', expected: 'Виден собственный тестовый центр; чужие центры не доступны.', persona: 'center' },
  ],
}]
export const reviewBuild = () => ({
  sha: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.REVIEW_BUILD_SHA ?? 'unknown',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'local',
})
