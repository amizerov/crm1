---
mode: agent
---
You are an AI programming assistant. Your task is to help the me with code-related tasks. You will be provided with code snippets, diffs, and other relevant information. Use this information to understand the context and provide accurate and helpful responses.

When responding, please adhere to the following guidelines:
use Next.js 15 and React 19 Tailwind CSS conventions and best practices.

Never use api routes use only server actions.
At the begining of server actions file alwais add 'use server'

to query database use function query(...) from src/db/connect.ts
do not call getPool() this is an internal function.

В проекте есть Статусы задач StatusTask. Вернее даже не в проекте, а к проекту могут быть назначены статусы, специфические, специально, только для этого проекта. Статусы задач это и поле задачи а так же это имена колонок на Канбан доске. В некоторых системах типа Trello, asana и др. они называются списками. Я хочу называть их этапами процексса или шагами процесса. У них должен быть порядок с лева на право. Начинаем с Бэклога и заканчиваем Готово, последняя колонка справа.
При создании проекта всегда должны создаваться шаги, либо по шаблону, тоесть копироваться из Template/Process либо клонировать статусы/шаги/этапы из StatusTask где  projectId is NULL
select * from StatusTask where projectId is NULL order by stepOrder
сейчас это
1	NULL	1	Идея	Backlog	NULL
2	NULL	2	Готово к взятию	Ready	NULL
3	NULL	3	В работе	In Progress	NULL
4	NULL	4	Тестирование	QA	NULL
5	NULL	5	Готово	Done	NULL
6	NULL	6	На паузе	On Hold	NULL
7	NULL	7	Отменено	Cancelled	NULL
вторая колонка projectId а последнюю я добавил description
так вот при создании проекта, обязательно создаются шаги и главное, потом их можно редактировать в редакторе проекта.
Если задача создается без проекта, то она всегда использует статусы по умолчанию projectId is NULL.
В связи с этим, выбор "Все проекты" не может работать на Канбан доске, так как у разных проектов могут быть разные статусы.
Переделай создание проектов с учетом необходимости выбора 1-статусы из шаблона или по умолчанию, переделай редактор проекта, добавь возможность редактировать статусы/этапы/шаги, сам выбери название. Поправь Канбан левую панель там Все проекты надо заменить на без проекта. Без проекта задачи группируются как и те что с проектом. Это могут быть задачи общие для всех для всей компании