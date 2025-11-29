// API Base URL
const API_BASE = '/api';

// State
let persons = [];
let relationships = [];
let filteredPersonId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeModals();
    initializeEventListeners();
    loadData();
});

// Tab Management
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Refresh data when switching to edit tab
    if (tabName === 'edit') {
        loadData();
    }

    // Redraw canvas when switching to view tab
    if (tabName === 'view') {
        drawFamilyTree();
    }
}

// Modal Management
function initializeModals() {
    // Person modal
    const personModal = document.getElementById('person-modal');
    const personClose = personModal.querySelector('.close');
    const personCancel = document.getElementById('cancel-person');

    personClose.onclick = () => personModal.style.display = 'none';
    personCancel.onclick = () => personModal.style.display = 'none';

    // Relationship modal
    const relModal = document.getElementById('relationship-modal');
    const relClose = relModal.querySelector('.close');
    const relCancel = document.getElementById('cancel-relationship');

    relClose.onclick = () => relModal.style.display = 'none';
    relCancel.onclick = () => relModal.style.display = 'none';

    // Close on outside click
    window.onclick = (event) => {
        if (event.target === personModal) personModal.style.display = 'none';
        if (event.target === relModal) relModal.style.display = 'none';
    };
}

// Event Listeners
function initializeEventListeners() {
    // Add person button
    document.getElementById('add-person-btn').addEventListener('click', () => {
        openPersonModal();
    });

    // Add relationship button
    document.getElementById('add-relationship-btn').addEventListener('click', () => {
        openRelationshipModal();
    });

    // Person form submit
    document.getElementById('person-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePerson();
    });

    // Relationship form submit
    document.getElementById('relationship-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveRelationship();
    });

    // Filter
    document.getElementById('apply-filter').addEventListener('click', applyFilter);
    document.getElementById('clear-filter').addEventListener('click', clearFilter);

    // Import/Export
    document.getElementById('import-csv-btn').addEventListener('click', importCSV);
    document.getElementById('import-json-btn').addEventListener('click', importJSON);
    document.getElementById('export-csv-btn').addEventListener('click', exportCSV);
    document.getElementById('export-json-btn').addEventListener('click', exportJSON);
}

// Data Loading
async function loadData() {
    try {
        const response = await fetch(`${API_BASE}/family`);
        const data = await response.json();
        persons = data.persons || [];
        relationships = data.relationships || [];

        updatePersonsTable();
        updateRelationshipsTable();
        drawFamilyTree();
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        alert('データの読み込みに失敗しました');
    }
}

// Person Modal
function openPersonModal(person = null) {
    const modal = document.getElementById('person-modal');
    const form = document.getElementById('person-form');
    const title = document.getElementById('modal-title');

    if (person) {
        title.textContent = '人物を編集';
        document.getElementById('person-id').value = person.id;
        document.getElementById('person-name').value = person.name;
        document.getElementById('person-gender').value = person.gender || '';
        document.getElementById('person-birth').value = person.birth_date || '';
        document.getElementById('person-death').value = person.death_date || '';
        document.getElementById('person-adopted').checked = person.is_adopted;
        document.getElementById('person-notes').value = person.notes || '';
    } else {
        title.textContent = '人物を追加';
        form.reset();
        document.getElementById('person-id').value = '';
    }

    modal.style.display = 'block';
}

async function savePerson() {
    const id = document.getElementById('person-id').value;
    const data = {
        id: id || undefined,
        name: document.getElementById('person-name').value,
        gender: document.getElementById('person-gender').value,
        birth_date: document.getElementById('person-birth').value,
        death_date: document.getElementById('person-death').value,
        is_adopted: document.getElementById('person-adopted').checked,
        notes: document.getElementById('person-notes').value
    };

    try {
        const response = await fetch(`${API_BASE}/person`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('person-modal').style.display = 'none';
            await loadData();
        } else {
            alert('保存に失敗しました');
        }
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました');
    }
}

async function deletePerson(id) {
    if (!confirm('この人物を削除しますか?')) return;

    try {
        const response = await fetch(`${API_BASE}/person/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadData();
        } else {
            alert('削除に失敗しました');
        }
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
}

// Relationship Modal
function openRelationshipModal() {
    const modal = document.getElementById('relationship-modal');
    const person1Select = document.getElementById('rel-person1');
    const person2Select = document.getElementById('rel-person2');

    // Populate person selects
    person1Select.innerHTML = '<option value="">選択してください</option>';
    person2Select.innerHTML = '<option value="">選択してください</option>';

    persons.forEach(person => {
        const option1 = document.createElement('option');
        option1.value = person.id;
        option1.textContent = person.name;
        person1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = person.id;
        option2.textContent = person.name;
        person2Select.appendChild(option2);
    });

    document.getElementById('relationship-form').reset();
    modal.style.display = 'block';
}

async function saveRelationship() {
    const data = {
        person1_id: document.getElementById('rel-person1').value,
        person2_id: document.getElementById('rel-person2').value,
        type: document.getElementById('rel-type').value
    };

    try {
        const response = await fetch(`${API_BASE}/relationship`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('relationship-modal').style.display = 'none';
            await loadData();
        } else {
            alert('保存に失敗しました');
        }
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました');
    }
}

async function deleteRelationship(id) {
    if (!confirm('この関係を削除しますか?')) return;

    try {
        const response = await fetch(`${API_BASE}/relationship/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadData();
        } else {
            alert('削除に失敗しました');
        }
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました');
    }
}

// Table Updates
function updatePersonsTable() {
    const tbody = document.getElementById('persons-tbody');
    tbody.innerHTML = '';

    persons.forEach(person => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${person.id}</td>
            <td>${person.name}</td>
            <td>${person.gender || '-'}</td>
            <td>${person.birth_date || '-'}</td>
            <td>${person.death_date || '-'}</td>
            <td>${person.is_adopted ? '✓' : ''}</td>
            <td>${person.notes || '-'}</td>
            <td>
                <button class="btn-edit" onclick="editPerson(${person.id})">編集</button>
                <button class="btn-danger" onclick="deletePerson(${person.id})">削除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateRelationshipsTable() {
    const tbody = document.getElementById('relationships-tbody');
    tbody.innerHTML = '';

    relationships.forEach(rel => {
        const person1 = persons.find(p => p.id === rel.person1_id);
        const person2 = persons.find(p => p.id === rel.person2_id);

        const typeMap = {
            'spouse': '配偶者',
            'ex_spouse': '前配偶者',
            'parent_child': '親子'
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${rel.id}</td>
            <td>${person1 ? person1.name : '不明'}</td>
            <td>${person2 ? person2.name : '不明'}</td>
            <td>${typeMap[rel.type] || rel.type}</td>
            <td>
                <button class="btn-danger" onclick="deleteRelationship(${rel.id})">削除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Global functions for onclick handlers
window.editPerson = function (id) {
    const person = persons.find(p => p.id === id);
    if (person) openPersonModal(person);
};

window.deletePerson = deletePerson;
window.deleteRelationship = deleteRelationship;

// Filter
function applyFilter() {
    const name = document.getElementById('filter-name').value.trim();
    if (!name) {
        alert('名前を入力してください');
        return;
    }

    const person = persons.find(p => p.name.includes(name));
    if (!person) {
        alert('該当する人物が見つかりません');
        return;
    }

    filteredPersonId = person.id;
    drawFamilyTree();
}

function clearFilter() {
    filteredPersonId = null;
    document.getElementById('filter-name').value = '';
    drawFamilyTree();
}

// Family Tree Drawing
function drawFamilyTree() {
    const canvas = document.getElementById('family-tree-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter persons if needed
    let displayPersons = persons;
    if (filteredPersonId) {
        displayPersons = getRelatedPersons(filteredPersonId);
    }

    if (displayPersons.length === 0) {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('データがありません', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Build family tree structure
    const tree = buildFamilyTree(displayPersons);

    // Draw the tree
    renderTree(ctx, tree);
}

function getRelatedPersons(personId) {
    const related = new Set([personId]);
    let changed = true;

    while (changed) {
        changed = false;
        const currentSize = related.size;

        relationships.forEach(rel => {
            if (related.has(rel.person1_id)) {
                related.add(rel.person2_id);
            }
            if (related.has(rel.person2_id)) {
                related.add(rel.person1_id);
            }
        });

        if (related.size > currentSize) {
            changed = true;
        }
    }

    return persons.filter(p => related.has(p.id));
}

function buildFamilyTree(displayPersons) {
    // Simple layout: arrange persons in rows
    const personMap = new Map();
    displayPersons.forEach((person, index) => {
        personMap.set(person.id, {
            person,
            x: 100 + (index % 5) * 200,
            y: 100 + Math.floor(index / 5) * 150
        });
    });

    return { personMap, relationships };
}

function renderTree(ctx, tree) {
    const { personMap, relationships } = tree;

    // Draw relationships first (lines)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;

    relationships.forEach(rel => {
        const node1 = personMap.get(rel.person1_id);
        const node2 = personMap.get(rel.person2_id);

        if (!node1 || !node2) return;

        ctx.beginPath();

        if (rel.type === 'spouse') {
            // Double line for spouse
            ctx.moveTo(node1.x + 60, node1.y + 20);
            ctx.lineTo(node2.x, node2.y + 20);
            ctx.stroke();
            ctx.moveTo(node1.x + 60, node1.y + 25);
            ctx.lineTo(node2.x, node2.y + 25);
            ctx.stroke();
        } else if (rel.type === 'ex_spouse') {
            // Single line for ex-spouse
            ctx.setLineDash([5, 5]);
            ctx.moveTo(node1.x + 60, node1.y + 20);
            ctx.lineTo(node2.x, node2.y + 20);
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (rel.type === 'parent_child') {
            // Vertical line for parent-child
            ctx.moveTo(node1.x + 30, node1.y + 40);
            ctx.lineTo(node2.x + 30, node2.y);
            ctx.stroke();
        }
    });

    // Draw persons (boxes)
    personMap.forEach(node => {
        const { person, x, y } = node;

        // Box
        ctx.fillStyle = person.gender === '男性' ? '#dbeafe' : '#fce7f3';
        ctx.fillRect(x, y, 120, 40);
        ctx.strokeStyle = person.gender === '男性' ? '#2563eb' : '#ec4899';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 120, 40);

        // Name
        ctx.fillStyle = '#1e293b';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(person.name, x + 60, y + 25);

        // Adopted indicator
        if (person.is_adopted) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.strokeRect(x - 2, y - 2, 124, 44);
        }

        // Underline if no spouse
        const hasSpouse = relationships.some(r =>
            (r.person1_id === person.id || r.person2_id === person.id) &&
            (r.type === 'spouse' || r.type === 'ex_spouse')
        );

        if (!hasSpouse) {
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y + 45);
            ctx.lineTo(x + 120, y + 45);
            ctx.stroke();
        }
    });
}

// Import/Export
async function importCSV() {
    const csvData = document.getElementById('csv-input').value.trim();
    if (!csvData) {
        alert('CSVデータを入力してください');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/import/csv`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csvData })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            document.getElementById('csv-input').value = '';
            await loadData();
        } else {
            alert('インポートに失敗しました: ' + result.error);
        }
    } catch (error) {
        console.error('インポートエラー:', error);
        alert('インポートに失敗しました');
    }
}

async function importJSON() {
    const jsonData = document.getElementById('json-input').value.trim();
    if (!jsonData) {
        alert('JSONデータを入力してください');
        return;
    }

    try {
        const data = JSON.parse(jsonData);
        const response = await fetch(`${API_BASE}/import/json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            document.getElementById('json-input').value = '';
            await loadData();
        } else {
            alert('インポートに失敗しました: ' + result.error);
        }
    } catch (error) {
        console.error('インポートエラー:', error);
        alert('JSONの解析に失敗しました');
    }
}

async function exportCSV() {
    try {
        window.location.href = `${API_BASE}/export/csv`;
    } catch (error) {
        console.error('エクスポートエラー:', error);
        alert('エクスポートに失敗しました');
    }
}

async function exportJSON() {
    try {
        window.location.href = `${API_BASE}/export/json`;
    } catch (error) {
        console.error('エクスポートエラー:', error);
        alert('エクスポートに失敗しました');
    }
}
