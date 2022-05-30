import './styles/styles.less';

// API ключ
const apiKey = '89ae88cdfedf514e4edaa175';

// Элементы интерфейса
const fromCurrency = {
    select: document.querySelector('[data-currency-name-from]'),
    input: document.querySelector('[data-currency-amount-from]'),
};
const toCurrency = {
    select: document.querySelector('[data-currency-name-to]'),
    input: document.querySelector('[data-currency-amount-to]'),
};
const buttonSwap = document.querySelector('[data-swap]');
const rateElement = document.querySelector('[data-rate]');

// Поменять валюты местами
const swap = () => {
    const fromCurrencyName = fromCurrency.select.value;
    fromCurrency.select.value = toCurrency.select.value;
    toCurrency.select.value = fromCurrencyName;
    calculate();
};

// Рассчитать курс валют
const calculate = () => {
    const fromCurrencyName = fromCurrency.select.value;
    const request = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrencyName}`;
    const toCurrencyName = toCurrency.select.value;

    fetch(request)
        .then((response) => response.json())
        .then((data) => {
            const conversionRate = data.conversion_rates[toCurrencyName];
            const toCurrencyAmount = conversionRate * fromCurrency.input.value;
            toCurrency.input.value = toCurrencyAmount.toFixed(2);

            rateElement.textContent = `1 ${fromCurrencyName} = ${conversionRate} ${toCurrencyName}`;
        });
};

// Обработчики событий
fromCurrency.select.addEventListener('change', calculate);
toCurrency.select.addEventListener('change', calculate);
fromCurrency.input.addEventListener('input', calculate);
toCurrency.input.addEventListener('input', calculate);
buttonSwap.addEventListener('click', swap);

calculate();