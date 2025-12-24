import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
    en: {
        translation: {
            "app": {
                "title": "Apiary Management",
                "dashboard": "Dashboard",
                "hives": "Hives",
                "settings": "Settings"
            },
            "common": {
                "add": "Add",
                "cancel": "Cancel",
                "save": "Save",
                "delete": "Delete",
                "edit": "Edit",
                "date": "Date",
                "notes": "Notes"
            },
            "dashboard": {
                "totalHives": "Total Hives",
                "totalHoney": "Total Honey (Season)",
                "needsInspection": "Needs Inspection",
                "addHive": "Add New Hive"
            },
            "hives": {
                "number": "Number",
                "type": "Type",
                "status": "Status",
                "queenYear": "Queen Year",
                "breed": "Breed",
                "color": "Color",
                "configuration": "Configuration",
                "addBox": "Add Box",
                "removeBox": "Remove Top Box",
                "boxType": "Box Type",
                "frames": "Frames",
                "frameContent": {
                    "honey": "Honey",
                    "brood": "Brood",
                    "foundation": "Foundation",
                    "empty": "Empty"
                }
            },
            "tabs": {
                "overview": "Overview",
                "inspections": "Inspections",
                "harvests": "Harvests",
                "treatments": "Treatments"
            }
        }
    },
    ru: {
        translation: {
            "app": {
                "title": "Управление Пасекой",
                "dashboard": "Дашборд",
                "hives": "Ульи",
                "settings": "Настройки"
            },
            "common": {
                "add": "Добавить",
                "cancel": "Отмена",
                "save": "Сохранить",
                "delete": "Удалить",
                "edit": "Изменить",
                "date": "Дата",
                "notes": "Заметки"
            },
            "dashboard": {
                "totalHives": "Всего Ульев",
                "totalHoney": "Мёд (Сезон)",
                "needsInspection": "Требует Осмотра",
                "addHive": "Добавить Улей"
            },
            "hives": {
                "number": "Номер",
                "type": "Тип",
                "status": "Статус",
                "queenYear": "Год Матки",
                "breed": "Порода",
                "color": "Цвет",
                "configuration": "Конфигурация",
                "addBox": "Добавить Корпус",
                "removeBox": "Убрать Верхний",
                "boxType": "Тип Корпуса",
                "frames": "Рамки",
                "frameContent": {
                    "honey": "Мёд",
                    "brood": "Расплод",
                    "foundation": "Вощина",
                    "empty": "Пустая"
                }
            },
            "tabs": {
                "overview": "Обзор",
                "inspections": "Осмотры",
                "harvests": "Мёдосборы",
                "treatments": "Обработки"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "ru", // Default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
