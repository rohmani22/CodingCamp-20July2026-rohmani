/* =========================================
   EXPENSE & BUDGET VISUALIZER
========================================= */


/* =========================================
   STORAGE KEYS
========================================= */

const TRANSACTIONS_KEY = "spendly_transactions";
const CATEGORIES_KEY = "spendly_custom_categories";
const THEME_KEY = "spendly_theme";


/* =========================================
   DEFAULT DATA
========================================= */

let transactions =
    JSON.parse(
        localStorage.getItem(TRANSACTIONS_KEY)
    ) || [];


let customCategories =
    JSON.parse(
        localStorage.getItem(CATEGORIES_KEY)
    ) || [];


let expenseChart = null;


/* =========================================
   DOM ELEMENTS
========================================= */

const transactionForm =
    document.getElementById("transactionForm");

const itemNameInput =
    document.getElementById("itemName");

const amountInput =
    document.getElementById("amount");

const categoryInput =
    document.getElementById("category");

const transactionDateInput =
    document.getElementById("transactionDate");

const transactionList =
    document.getElementById("transactionList");

const emptyState =
    document.getElementById("emptyState");

const totalBalance =
    document.getElementById("totalBalance");

const totalTransactions =
    document.getElementById("totalTransactions");

const averageExpense =
    document.getElementById("averageExpense");

const highestExpense =
    document.getElementById("highestExpense");

const emptyChart =
    document.getElementById("emptyChart");

const chartLegend =
    document.getElementById("chartLegend");

const categoryForm =
    document.getElementById("categoryForm");

const customCategoryName =
    document.getElementById("customCategoryName");

const customCategoryList =
    document.getElementById("customCategoryList");

const sortFilter =
    document.getElementById("sortFilter");

const monthFilter =
    document.getElementById("monthFilter");

const monthlyTotal =
    document.getElementById("monthlyTotal");

const monthlyTransactions =
    document.getElementById("monthlyTransactions");

const monthlyTopCategory =
    document.getElementById("monthlyTopCategory");

const themeToggle =
    document.getElementById("themeToggle");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================
   CATEGORY CONFIGURATION
========================================= */

const categoryIcons = {

    Food: "🍔",

    Transport: "🚗",

    Fun: "🎮"

};


const categoryColors = {

    Food: "#f97316",

    Transport: "#3b82f6",

    Fun: "#a855f7"

};


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setDefaultDate();

        loadTheme();

        updateCategoryOptions();

        updateCustomCategoryList();

        populateMonthFilter();

        renderAll();

    }
);


/* =========================================
   SET DEFAULT DATE
========================================= */

function setDefaultDate() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    transactionDateInput.value =
        today;

}


/* =========================================
   FORM SUBMIT
========================================= */

transactionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            itemNameInput.value.trim();

        const amount =
            Number(amountInput.value);

        const category =
            categoryInput.value;

        const date =
            transactionDateInput.value;


        if (
            !name ||
            !amount ||
            amount <= 0 ||
            !category ||
            !date
        ) {

            showToast(
                "Mohon isi semua data dengan benar."
            );

            return;

        }


        const newTransaction = {

            id:
                Date.now(),

            name:
                name,

            amount:
                amount,

            category:
                category,

            date:
                date

        };


        transactions.push(
            newTransaction
        );


        saveTransactions();

        renderAll();

        transactionForm.reset();

        setDefaultDate();


        showToast(
            "Transaksi berhasil ditambahkan."
        );

    }
);


/* =========================================
   SAVE TRANSACTIONS
========================================= */

function saveTransactions() {

    localStorage.setItem(

        TRANSACTIONS_KEY,

        JSON.stringify(
            transactions
        )

    );

}


/* =========================================
   RENDER ALL
========================================= */

function renderAll() {

    updateSummary();

    renderTransactions();

    updateChart();

    populateMonthFilter();

    updateMonthlySummary();

}


/* =========================================
   UPDATE SUMMARY
========================================= */

function updateSummary() {

    const total =
        transactions.reduce(

            (sum, transaction) =>

                sum +
                Number(
                    transaction.amount
                ),

            0

        );


    const count =
        transactions.length;


    const average =
        count > 0

            ? total / count

            : 0;


    const highest =
        count > 0

            ? Math.max(

                ...transactions.map(

                    transaction =>
                        Number(
                            transaction.amount
                        )

                )

            )

            : 0;


    totalBalance.textContent =
        formatCurrency(total);


    totalTransactions.textContent =
        count;


    averageExpense.textContent =
        formatCurrency(average);


    highestExpense.textContent =
        formatCurrency(highest);

}


/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(

        "id-ID",

        {

            style:
                "currency",

            currency:
                "IDR",

            maximumFractionDigits:
                0

        }

    ).format(amount);

}


/* =========================================
   RENDER TRANSACTIONS
========================================= */

function renderTransactions() {

    transactionList.innerHTML = "";


    if (
        transactions.length === 0
    ) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    const sortedTransactions =
        [...transactions];


    const sortType =
        sortFilter.value;


    if (
        sortType === "newest"
    ) {

        sortedTransactions.sort(

            (a, b) =>

                new Date(b.date) -
                new Date(a.date)

        );

    }


    if (
        sortType === "oldest"
    ) {

        sortedTransactions.sort(

            (a, b) =>

                new Date(a.date) -
                new Date(b.date)

        );

    }


    if (
        sortType === "highest"
    ) {

        sortedTransactions.sort(

            (a, b) =>

                b.amount -
                a.amount

        );

    }


    if (
        sortType === "lowest"
    ) {

        sortedTransactions.sort(

            (a, b) =>

                a.amount -
                b.amount

        );

    }


    sortedTransactions.forEach(

        transaction => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "transaction-item";


            const icon =
                categoryIcons[
                    transaction.category
                ] || "📦";


            const formattedDate =
                formatDate(
                    transaction.date
                );


            item.innerHTML = `

                <div class="transaction-info">

                    <div class="transaction-icon">
                        ${icon}
                    </div>

                    <div>

                        <div class="transaction-name">
                            ${escapeHTML(
                                transaction.name
                            )}
                        </div>

                        <div class="transaction-meta">

                            ${escapeHTML(
                                transaction.category
                            )}

                            •

                            ${formattedDate}

                        </div>

                    </div>

                </div>


                <div class="transaction-right">

                    <span class="transaction-amount">

                        ${formatCurrency(
                            transaction.amount
                        )}

                    </span>


                    <button

                        class="delete-button"

                        data-id="${transaction.id}"

                        aria-label="Hapus transaksi"

                    >

                        🗑️

                    </button>

                </div>

            `;


            transactionList.appendChild(
                item
            );

        }

    );

}


/* =========================================
   DELETE TRANSACTION
========================================= */

transactionList.addEventListener(

    "click",

    function (event) {

        const button =
            event.target.closest(
                ".delete-button"
            );


        if (!button) {

            return;

        }


        const id =
            Number(
                button.dataset.id
            );


        const confirmed =
            confirm(
                "Apakah Anda yakin ingin menghapus transaksi ini?"
            );


        if (!confirmed) {

            return;

        }


        transactions =
            transactions.filter(

                transaction =>

                    transaction.id !== id

            );


        saveTransactions();

        renderAll();


        showToast(
            "Transaksi berhasil dihapus."
        );

    }

);


/* =========================================
   SORT TRANSACTIONS
========================================= */

sortFilter.addEventListener(

    "change",

    renderTransactions

);


/* =========================================
   UPDATE CHART
========================================= */

function updateChart() {

    const categoryTotals = {};


    transactions.forEach(

        transaction => {

            const category =
                transaction.category;


            if (
                !categoryTotals[
                    category
                ]
            ) {

                categoryTotals[
                    category
                ] = 0;

            }


            categoryTotals[
                category
            ] += Number(
                transaction.amount
            );

        }

    );


    const labels =
        Object.keys(
            categoryTotals
        );


    const values =
        Object.values(
            categoryTotals
        );


    if (
        expenseChart
    ) {

        expenseChart.destroy();

        expenseChart =
            null;

    }


    if (
        transactions.length === 0
    ) {

        emptyChart.style.display =
            "flex";

        chartLegend.innerHTML =
            "";

        return;

    }


    emptyChart.style.display =
        "none";


    const canvas =
        document.getElementById(
            "expenseChart"
        );


    const colors =
        labels.map(

            category =>

                categoryColors[
                    category
                ] ||
                generateColor(
                    category
                )

        );


    expenseChart =
        new Chart(

            canvas,

            {

                type:
                    "doughnut",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            data:
                                values,

                            backgroundColor:
                                colors,

                            borderWidth:
                                0

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "65%",

                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    }

                }

            }

        );


    renderChartLegend(
        labels,
        colors,
        values
    );

}


/* =========================================
   CHART LEGEND
========================================= */

function renderChartLegend(
    labels,
    colors,
    values
) {

    chartLegend.innerHTML =
        "";


    labels.forEach(

        (label, index) => {

            const legend =
                document.createElement(
                    "div"
                );


            legend.className =
                "legend-item";


            legend.innerHTML = `

                <span

                    class="legend-dot"

                    style="background:
                        ${colors[index]}"

                ></span>

                <span>

                    ${escapeHTML(label)}

                    :

                    ${formatCurrency(
                        values[index]
                    )}

                </span>

            `;


            chartLegend.appendChild(
                legend
            );

        }

    );

}


/* =========================================
   CUSTOM CATEGORY
========================================= */

categoryForm.addEventListener(

    "submit",

    function (event) {

        event.preventDefault();


        const name =
            customCategoryName.value.trim();


        if (!name) {

            return;

        }


        const exists =
            customCategories.some(

                category =>

                    category.toLowerCase() ===
                    name.toLowerCase()

            );


        if (exists) {

            showToast(
                "Kategori sudah tersedia."
            );

            return;

        }


        customCategories.push(
            name
        );


        localStorage.setItem(

            CATEGORIES_KEY,

            JSON.stringify(
                customCategories
            )

        );


        updateCategoryOptions();

        updateCustomCategoryList();


        customCategoryName.value =
            "";


        showToast(
            "Kategori berhasil ditambahkan."
        );

    }

);


/* =========================================
   UPDATE CATEGORY OPTIONS
========================================= */

function updateCategoryOptions() {

    const currentValue =
        categoryInput.value;


    categoryInput.innerHTML = `

        <option value="">

            Pilih kategori

        </option>


        <option value="Food">

            🍔 Makanan

        </option>


        <option value="Transport">

            🚗 Transportasi

        </option>


        <option value="Fun">

            🎮 Hiburan

        </option>

    `;


    customCategories.forEach(

        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                `📦 ${category}`;


            categoryInput.appendChild(
                option
            );

        }

    );


    if (
        currentValue
    ) {

        categoryInput.value =
            currentValue;

    }

}


/* =========================================
   CUSTOM CATEGORY LIST
========================================= */

function updateCustomCategoryList() {

    customCategoryList.innerHTML =
        "";


    customCategories.forEach(

        category => {

            const tag =
                document.createElement(
                    "div"
                );


            tag.className =
                "category-tag";


            tag.innerHTML = `

                <span>
                    ${escapeHTML(category)}
                </span>

                <button

                    class="category-delete"

                    data-category="${escapeHTML(
                        category
                    )}"

                >

                    ×

                </button>

            `;


            customCategoryList.appendChild(
                tag
            );

        }

    );

}


/* =========================================
   DELETE CUSTOM CATEGORY
========================================= */

customCategoryList.addEventListener(

    "click",

    function (event) {

        const button =
            event.target.closest(
                ".category-delete"
            );


        if (!button) {

            return;

        }


        const category =
            button.dataset.category;


        customCategories =
            customCategories.filter(

                item =>

                    item !== category

            );


        localStorage.setItem(

            CATEGORIES_KEY,

            JSON.stringify(
                customCategories
            )

        );


        updateCategoryOptions();

        updateCustomCategoryList();


        showToast(
            "Kategori berhasil dihapus."
        );

    }

);


/* =========================================
   MONTH FILTER
========================================= */

function populateMonthFilter() {

    const currentValue =
        monthFilter.value;


    const months =
        new Set();


    transactions.forEach(

        transaction => {

            const month =
                transaction.date.substring(
                    0,
                    7
                );


            months.add(
                month
            );

        }

    );


    const currentMonth =
        new Date()
            .toISOString()
            .substring(
                0,
                7
            );


    months.add(
        currentMonth
    );


    const sortedMonths =
        [...months].sort().reverse();


    monthFilter.innerHTML =
        "";


    sortedMonths.forEach(

        month => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                month;


            option.textContent =
                formatMonth(
                    month
                );


            monthFilter.appendChild(
                option
            );

        }

    );


    if (
        sortedMonths.includes(
            currentValue
        )
    ) {

        monthFilter.value =
            currentValue;

    }

}


/* =========================================
   MONTHLY SUMMARY
========================================= */

function updateMonthlySummary() {

    const selectedMonth =
        monthFilter.value;


    const monthlyData =
        transactions.filter(

            transaction =>

                transaction.date.startsWith(
                    selectedMonth
                )

        );


    const total =
        monthlyData.reduce(

            (sum, transaction) =>

                sum +
                Number(
                    transaction.amount
                ),

            0

        );


    monthlyTotal.textContent =
        formatCurrency(total);


    monthlyTransactions.textContent =
        monthlyData.length;


    if (
        monthlyData.length === 0
    ) {

        monthlyTopCategory.textContent =
            "-";

        return;

    }


    const categories = {};


    monthlyData.forEach(

        transaction => {

            if (
                !categories[
                    transaction.category
                ]
            ) {

                categories[
                    transaction.category
                ] = 0;

            }


            categories[
                transaction.category
            ] += Number(
                transaction.amount
            );

        }

    );


    const topCategory =
        Object.entries(
            categories
        ).sort(

            (a, b) =>

                b[1] -
                a[1]

        )[0];


    monthlyTopCategory.textContent =
        topCategory[0];

}


/* =========================================
   MONTH FILTER EVENT
========================================= */

monthFilter.addEventListener(

    "change",

    updateMonthlySummary

);


/* =========================================
   DARK MODE
========================================= */

themeToggle.addEventListener(

    "click",

    function () {

        document.body.classList.toggle(
            "dark-mode"
        );


        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );


        localStorage.setItem(

            THEME_KEY,

            isDark
                ? "dark"
                : "light"

        );


        themeToggle.textContent =
            isDark
                ? "☀️"
                : "🌙";

    }

);


/* =========================================
   LOAD THEME
========================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (
        theme === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );


        themeToggle.textContent =
            "☀️";

    }

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(

        "id-ID",

        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }

    );

}


/* =========================================
   FORMAT MONTH
========================================= */

function formatMonth(monthString) {

    const date =
        new Date(
            monthString + "-01T00:00:00"
        );


    return date.toLocaleDateString(

        "id-ID",

        {

            month:
                "long",

            year:
                "numeric"

        }

    );

}


/* =========================================
   GENERATE COLOR
========================================= */

function generateColor(text) {

    let hash = 0;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        hash =
            text.charCodeAt(i) +
            ((hash << 5) - hash);

    }


    const hue =
        Math.abs(hash) % 360;


    return `hsl(${hue}, 70%, 55%)`;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(

        () => {

            toast.classList.remove(
                "show"
            );

        },

        2500

    );

}