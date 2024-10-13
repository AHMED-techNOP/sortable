let allHeroes = [];
let currentPage = 1;
let pageSize = 20;
let sortColumn = 'name';
let sortDirection = 'asc';

const loadData = (heroes) => {
    allHeroes = heroes;
    displayHeroes();
};

fetch('https://rawcdn.githack.com/akabab/superhero-api/0.2.0/api/all.json')
  .then((response) => response.json())
  .then(loadData);

function displayHeroes() {
    const tableBody = document.getElementById('heroTableBody');
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * pageSize;
    const end = pageSize === 'all' ? allHeroes.length : start + parseInt(pageSize);

    const filteredHeroes = allHeroes.filter(hero => 
        hero.name.toLowerCase().includes(document.getElementById('searchInput').value.toLowerCase())
    );

    sortHeroes(filteredHeroes);

    const paginated = filteredHeroes.slice(start, end);
    paginated.forEach(hero => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td><img src="${hero.images.xs}" alt="${hero.name}"></td>
            <td>${hero.name}</td>
            <td>${hero.biography.fullName}</td>
            <td>${Object.entries(hero.powerstats).map(([key, value]) => `${key}: ${value}`).join('<br>')}</td>
            <td>${hero.appearance.race || 'Unknown'}</td>
            <td>${hero.appearance.gender}</td>
            <td>${hero.appearance.height.join(', ')}</td>
            <td>${hero.appearance.weight.join(', ')}</td>
            <td>${hero.biography.placeOfBirth}</td>
            <td>${hero.biography.alignment}</td>
        `;
    });

    updatePagination(filteredHeroes.length);
}

function updatePagination(totalItems) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    if (pageSize === 'all') return;

    const totalPages = Math.ceil(totalItems / pageSize);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayHeroes();
        }
    };
    paginationDiv.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => {
            currentPage = i;
            displayHeroes();
        };
        if (i === currentPage) {
            pageButton.disabled = true;
        }
        paginationDiv.appendChild(pageButton);
    }

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayHeroes();
        }
    };
    paginationDiv.appendChild(nextButton);
}

function sortHeroes(heroes) {
    heroes.sort((a, b) => {
        let valA, valB;

        switch (sortColumn) {
            case 'name':
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
                break;
            case 'fullName':
                valA = (a.biography.fullName || '').toLowerCase();
                valB = (b.biography.fullName || '').toLowerCase(); 
                break;
            case 'power':
                valA = Object.values(a.powerstats).reduce((sum, stat) => sum + stat, 0);
                valB = Object.values(b.powerstats).reduce((sum, stat) => sum + stat, 0);
                break;
            case 'height':
                valA = parseInt(a.appearance.height[1].replace('cm', '')) || 0;
                valB = parseInt(b.appearance.height[1].replace('cm', '')) || 0;
                break;
            case 'weight':
                valA = parseInt(a.appearance.weight[1].replace('kg', '')) || 0;
                valB = parseInt(b.appearance.weight[1].replace('kg', '')) || 0;
                break;
            default:
                valA = (a[sortColumn] || '').toLowerCase();
                valB = (b[sortColumn] || '').toLowerCase();
        }
        if (valA == ''||valA == null) return true
        if (sortDirection === 'asc') {
            return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
            return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
    });
}

function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    displayHeroes();
}

document.getElementById('pageSize').addEventListener('change', (e) => {
    pageSize = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    currentPage = 1;
    displayHeroes();
});

document.getElementById('searchInput').addEventListener('input', () => {
    currentPage = 1;
    displayHeroes();
});

// Add event listeners to table headers for sorting
document.querySelectorAll('th').forEach(th => {
    th.addEventListener('click', () => {
        sortTable(th.dataset.column);
    });
});