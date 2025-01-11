let currentRow;
let allRows = [];

document.addEventListener('DOMContentLoaded', (event) => {
    loadAccounts();
});

function saveAccount() {
    const accountData = document.getElementById('account-data').value;
    const providerData = document.getElementById('provider-data').value;
    const date = new Date().toLocaleString();

    const tableBody = document.getElementById('accounts-body');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${accountData}</td>
        <td>${providerData}</td>
        <td>${date}</td>
        <td class="status-available">Disponible</td>
        <td>
            <input type="email" placeholder="Correo del Comprador" oninput="updateStatus(this)">
            <input type="tel" placeholder="Teléfono del Comprador">
        </td>
        <td></td>
        <td>
            <button class="btn" onclick="openModal(this)">Reporte de Falla</button>
            <div class="report-status hidden"></div>
        </td>
        <td>Sin Respuesta</td>
        <td>
            <button class="btn" onclick="openCopyModal(this)">Copiar</button>
            <button class="btn" onclick="deleteAccount(this)">Eliminar</button>
            <button class="btn" onclick="consultReport(this)">Consultar</button>
        </td>
    `;
    tableBody.appendChild(newRow);

    allRows.push(newRow.cloneNode(true));
    saveToLocalStorage();
}

function updateStatus(input) {
    const row = input.closest('tr');
    const statusCell = row.cells[3];
    const saleAndExpirationCell = row.cells[5];
    const buyerEmail = input.value;
    if (buyerEmail.includes('@')) {
        statusCell.textContent = 'Vendida';
        statusCell.classList.remove('status-available');
        statusCell.classList.add('status-sold');
        
        const saleDate = new Date();
        const saleDateString = saleDate.toLocaleString();

        const expirationDate = new Date(saleDate);
        expirationDate.setDate(expirationDate.getDate() + 30);
        const expirationDateString = expirationDate.toLocaleDateString();

        saleAndExpirationCell.textContent = `Fecha de Venta: ${saleDateString}, Fecha de Vencimiento: ${expirationDateString}`;
    } else {
        statusCell.textContent = 'Disponible';
        statusCell.classList.remove('status-sold');
        statusCell.classList.add('status-available');
        saleAndExpirationCell.textContent = '';
    }
    saveToLocalStorage();
}

function openCopyModal(button) {
    currentRow = button.closest('tr');
    document.getElementById('copyModal').style.display = "block";
}

function closeCopyModal() {
    document.getElementById('copyModal').style.display = "none";
}

function copyAccountData() {
    const row = currentRow;
    const accountData = row.cells[0].textContent;
    const purchaseDate = row.cells[2].textContent;
    const buyerEmail = row.cells[4].querySelector('input[type="email"]').value;
    const buyerPhone = row.cells[4].querySelector('input[type="tel"]').value;
    const saleAndExpiration = row.cells[5].textContent;

    const dataToCopy = `
        Datos de la Cuenta: ${accountData}
        Fecha de Compra: ${purchaseDate}
        Correo del Comprador: ${buyerEmail}
        Teléfono del Comprador: ${buyerPhone}
        ${saleAndExpiration}
        Gracias por su compra.
    `;

    navigator.clipboard.writeText(dataToCopy).then(() => {
        alert('VENDE Y GANA INFORMA: Datos copiados al portapapeles');
    });
    closeCopyModal();
}

function copyFailureReport() {
    const row = currentRow;
    const reportText = row.cells[6].querySelector('.report-status').classList.contains('hidden') ? "" : row.cells[6].querySelector('.report-status').innerText;
    const responseText = row.cells[7].textContent.split(' (Respondido a las ')[0]; // Remove the timestamp from the response

    const dataToCopy = `
        Reporte de Falla: ${reportText}
        Respuesta a la Falla: ${responseText}
        OFRECEMOS DISCULPAS POR LAS MOLESTIAS OCASIONADAS, GRACIAS POR SU PACIENCIA. 😊📞
    `;

    navigator.clipboard.writeText(dataToCopy).then(() => {
        alert('VENDE Y GANA INFORMA: Datos copiados al portapapeles');
    });
    closeCopyModal();
}

function deleteAccount(button) {
    const row = button.closest('tr');
    const index = allRows.findIndex(r => r.isEqualNode(row));
    if (index > -1) {
        allRows.splice(index, 1);
    }
    row.remove();
    saveToLocalStorage();
}

function filterAccounts() {
    const filter = document.getElementById('filter').value.toLowerCase();
    const filterDate = document.getElementById('filter-date').value;

    const tableBody = document.getElementById('accounts-body');
    tableBody.innerHTML = '';

    allRows.forEach(row => {
        const accountData = row.cells[0].textContent.toLowerCase();
        const purchaseDate = row.cells[2].textContent.split(',')[0]; // Obtener solo la parte de la fecha
        const buyerEmail = row.cells[4].querySelector('input[type="email"]').value.toLowerCase();
        const buyerPhone = row.cells[4].querySelector('input[type="tel"]').value.toLowerCase();
        const matchesFilter = accountData.includes(filter) || buyerEmail.includes(filter) || buyerPhone.includes(filter);
        const matchesDate = filterDate === '' || purchaseDate === filterDate;
        if (matchesFilter && matchesDate) {
            tableBody.appendChild(row);
        }
    });
}

function openModal(button) {
    currentRow = button.closest('tr');
    const reportInput = currentRow.cells[6].querySelector('button');
    const reportText = reportInput.textContent === "Falla Reportada" ? document.getElementById('failure-report').value : "";
    document.getElementById('failure-report').value = reportText;

    const responseCell = currentRow.cells[7];
    const responseText = responseCell.textContent === "Sin Respuesta" ? "" : responseCell.textContent;
    document.getElementById('failure-response').value = responseText;

    document.getElementById('myModal').style.display = "block";
}

function closeModal() {
    document.getElementById('myModal').style.display = "none";
}

function saveFailureReport() {
    const reportText = document.getElementById('failure-report').value;
    const reportDate = new Date().toLocaleString();
    
    if (reportText) {
        currentRow.cells[6].querySelector('.report-status').classList.remove('hidden');
        currentRow.cells[6].querySelector('.report-status').innerText = `Reporte: ${reportText} (Fecha: ${reportDate})`;
    } else {
        currentRow.cells[6].querySelector('.report-status').classList.add('hidden');
    }

    saveToLocalStorage();
}

function saveFailureResponse() {
    const responseText = document.getElementById('failure-response').value;
    const executive = document.getElementById('failure-executive').value;
    const responseDate = new Date().toLocaleString();

    if (responseText) {
        currentRow.cells[7].textContent = `Respuesta: ${responseText} (Ejecutivo: ${executive}, Fecha: ${responseDate})`;
    } else {
        currentRow.cells[7].textContent = "Sin Respuesta";
    }

    saveToLocalStorage();
    closeModal();
}

function consultReport(button) {
    const row = button.closest('tr');
    const reportStatus = row.cells[6].querySelector('.report-status').classList.contains('hidden') ? "Sin reporte de falla" : 
        `Falla Reportada: ${row.cells[6].querySelector('.report-status').innerText} - Respuesta: ${row.cells[7].textContent}`;
    alert('VENDE Y GANA INFORMA: ' + reportStatus);
}

function saveToLocalStorage() {
    const data = allRows.map(row => ({
        accountData: row.cells[0].textContent,
        providerData: row.cells[1].textContent,
        purchaseDate: row.cells[2].textContent,
        status: row.cells[3].textContent,
        buyerEmail: row.cells[4].querySelector('input[type="email"]').value,
        buyerPhone: row.cells[4].querySelector('input[type="tel"]').value,
        saleAndExpiration: row.cells[5].textContent,
        reportText: row.cells[6].querySelector('.report-status').innerText,
        responseText: row.cells[7].textContent,
    }));
    localStorage.setItem('accounts', JSON.stringify(data));
}

function loadAccounts() {
    const data = JSON.parse(localStorage.getItem('