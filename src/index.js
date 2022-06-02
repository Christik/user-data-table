import './styles/styles.less';
import Handlebars from 'handlebars/runtime';
import templateRows from './templates/table-rows.hbs';
import templateRow from './templates/table-row.hbs';

// Добавить хелпер ifEquals для шаблона hbs
Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Дефолтное количество пользователей
const defaultUsersCount = 5;

// Список пользователей
const users = [];

// Элементы интерфейса
const contentElement = document.querySelector('[data-content]');
const tableBodyElement = contentElement.querySelector('tbody');
const buttonAddUser = document.querySelector('[data-add-user');
const buttonShow = document.querySelector('[data-show]');

// Обновить отображение списка пользователей
const updateUsersView = (users) => {
    const template = templateRows({users});
    tableBodyElement.innerHTML = template;
};

// Создать нового пользователя
const createUser = async () => {
    const response = await fetch('https://randomuser.me/api/?nat=us');
    const data = await response.json();
    const userData = data.results[0];
    const dob = new Date(userData.dob.date);

    const user = {
        name: `${userData.name.last} ${userData.name.first}`,
        photo: userData.picture.large,
        dob: {
            date: dob,
            format: dob.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
            }),
        },
        gender: userData.gender,
        id: userData.id.value,
    };

    return user;
};

// Создать список пользователей
const createUsersList = async (list, count) => {
    for (let i = 0; i < count; i++) {
        const user = await createUser();
        list.push(user);
    }
};

const init = async () => {
    await createUsersList(users, defaultUsersCount);
    updateUsersView(users);
};

init();

// Установить/снять у кнопки статус загрузки
const toggleButtonLoadingStatus = (button) => {
    const loadingClass = 'button_loading';

    button.classList.toggle(loadingClass);
};

// Отфильтровать пользователей  
const filterUsers = (users, key, value) => {
    if (value === 'all') {
        return users;
    }

    const filteredUsers = users.filter((user) => (user[key] === value));

    return filteredUsers;
};

// Обработчик клика по кнопке 'Show ...'
const showButtonClickHandle = (event) => {
    const button = event.target;
    const { show: showTarget } = button.dataset;

    const filteredUsers = filterUsers(users, 'gender', showTarget);
    updateUsersView(filteredUsers);

    button.dataset.show = (showTarget === 'all') ? 'female' : 'all';
    button.textContent = `Show ${button.dataset.show}`;
};

// Сброс
const resetSortView = () => {
    const sortButtons = document.querySelectorAll('[data-sort]');

    sortButtons.forEach((sortButton) => {
        sortButton.dataset.sort = '';
    });
};

// Обработчик клика по кнопке 'Add user'
const addUserButtonClickHandle = async (event) => {
    const button = event.target;
    toggleButtonLoadingStatus(button);

    const newUser = await createUser();
    users.push(newUser);
    const template = templateRow(newUser);

    tableBodyElement.insertAdjacentHTML('beforeend', template);
    toggleButtonLoadingStatus(button);

    resetSortView();
};

// Получить индекс пользователя по его id
const getUserIndexById = (id) => {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            return i;
        }
    }

    return null;
};

// Удалить пользователя
const deleteUserById = (id) => {
    const index = getUserIndexById(id);

    users.splice(index, 1);
    updateUsersView(users);
};

// Обработчик клика по кнопке 'Delete'
const deleteButtonClickHandle = (event) => {
    const button = event.target.closest('[data-delete]');

    if (!button) {
        return;
    }

    const { id } = button.dataset;
    deleteUserById(id);
};

// Обновить data-sort у кнопки
const updateSortButtonData = (button, direction) => {
    resetSortView();

    if (direction === '') {
        button.dataset.sort = 'desc';
    } else {
        button.dataset.sort = (direction === 'asc') ? 'desc' : 'asc';
    }
};

// Сортировать список пользователей
const sortUsers = (users, key, direction) => {
    if (direction === '') {
        direction = 'asc';
    }
    const sortResult = (direction === 'asc') ? 1 : -1;

    users.sort((a, b) => {
        const isDob = (key === 'dob');
        const previousElement = isDob ? a[key].date : a[key];
        const nextElement = isDob ? b[key].date : b[key];

        if (previousElement > nextElement) {
            return sortResult;
        }
        if (previousElement < nextElement) {
            return -sortResult;
        }
        return 0;
    });
};

// Обработчик клика по кнопке сортировки
const sortButtonClickHandle = (event) => {
    const button = event.target.closest('[data-sort]');

    if (!button) {
        return;
    }

    let { sort: sortDirection, sortKey } = button.dataset;

    sortUsers(users, sortKey, sortDirection);
    updateUsersView(users);
    updateSortButtonData(button, sortDirection);
};

// Клик по кнопке 'Show Female'
buttonShow.addEventListener('click', (event) => {
    showButtonClickHandle(event);
});

// Клик по кнопке 'Add user'
buttonAddUser.addEventListener('click', (event) => {
    addUserButtonClickHandle(event);
});

// Клик по кнопке 'Delete' через делегирование
tableBodyElement.addEventListener('click', (event) => {
    deleteButtonClickHandle(event);
});

// Клик по кнопке соритровки через делегирование
contentElement.addEventListener('click', (event) => {
    sortButtonClickHandle(event);
});