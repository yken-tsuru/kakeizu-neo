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

// Family Tree Drawing - 指示に従った正しい表示形式
function drawFamilyTree() {
    const canvas = document.getElementById('family-tree-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1600;
    canvas.height = 1200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    const tree = buildFamilyTreeStructure(displayPersons);
    renderFamilyTree(ctx, tree);
}

function getRelatedPersons(personId) {
    const related = new Set([personId]);
    let changed = true;

    while (changed) {
        changed = false;
        const currentSize = related.size;

        relationships.forEach(rel => {
            if (related.has(rel.person1_id)) related.add(rel.person2_id);
            if (related.has(rel.person2_id)) related.add(rel.person1_id);
        });

        if (related.size > currentSize) changed = true;
    }

    return persons.filter(p => related.has(p.id));
}

function buildFamilyTreeStructure(displayPersons) {
    const personMap = new Map();
    displayPersons.forEach(p => personMap.set(p.id, p));

    // 夫婦を見つける
    const couples = [];
    const processedRels = new Set();

    relationships.forEach(rel => {
        if ((rel.type === 'spouse' || rel.type === 'ex_spouse') && !processedRels.has(rel.id)) {
            const p1 = personMap.get(rel.person1_id);
            const p2 = personMap.get(rel.person2_id);
            if (p1 && p2) {
                // 右に夫、左に妻
                let husband = null;
                let wife = null;

                // 性別で判定
                if (p1.gender === '男性' && p2.gender === '女性') {
                    husband = p1;
                    wife = p2;
                } else if (p1.gender === '女性' && p2.gender === '男性') {
                    husband = p2;
                    wife = p1;
                } else if (p1.gender === '男性') {
                    husband = p1;
                    wife = p2;
                } else if (p2.gender === '男性') {
                    husband = p2;
                    wife = p1;
                } else if (p1.gender === '女性') {
                    husband = p2;
                    wife = p1;
                } else if (p2.gender === '女性') {
                    husband = p1;
                    wife = p2;
                } else {
                    // 両方とも性別未設定
                    husband = p1;
                    wife = p2;
                }

                couples.push({
                    husband,
                    wife,
                    type: rel.type,
                    children: []
                });
                processedRels.add(rel.id);
            }
        }
    });

    // 親子関係を見つける
    const childParentMap = new Map();
    relationships.forEach(rel => {
        if (rel.type === 'parent_child') {
            const parentId = rel.person1_id;
            const childId = rel.person2_id;
            if (!childParentMap.has(childId)) {
                childParentMap.set(childId, []);
            }
            childParentMap.get(childId).push(parentId);
        }
    });

    // 子供を夫婦に割り当てる
    childParentMap.forEach((parentIds, childId) => {
        const child = personMap.get(childId);
        if (!child) return;

        let foundCouple = false;
        for (const couple of couples) {
            const coupleIds = [couple.husband?.id, couple.wife?.id].filter(id => id);
            if (parentIds.some(pid => coupleIds.includes(pid))) {
                couple.children.push(child);
                foundCouple = true;
                break;
            }
        }

        if (!foundCouple) {
            const parentId = parentIds[0];
            const parent = personMap.get(parentId);
            if (parent) {
                let singleParentCouple = couples.find(c =>
                    (c.husband?.id === parentId && !c.wife) ||
                    (c.wife?.id === parentId && !c.husband)
                );

                if (!singleParentCouple) {
                    singleParentCouple = {
                        husband: parent.gender === '男性' ? parent : null,
                        wife: parent.gender === '女性' ? parent : null,
                        type: 'single',
                        children: []
                    };
                    couples.push(singleParentCouple);
                }
                singleParentCouple.children.push(child);
            }
        }
    });

    // 兄弟姉妹：長男（長女）から順に右側から記述
    couples.forEach(couple => {
        couple.children.sort((a, b) => {
            const dateA = a.birth_date || '';
            const dateB = b.birth_date || '';
            return dateA.localeCompare(dateB);
        });
    });

    const allChildIds = new Set();
    couples.forEach(couple => {
        couple.children.forEach(child => allChildIds.add(child.id));
    });

    const rootCouples = couples.filter(couple => {
        const husbandIsChild = couple.husband && allChildIds.has(couple.husband.id);
        const wifeIsChild = couple.wife && allChildIds.has(couple.wife.id);
        return !husbandIsChild && !wifeIsChild;
    });

    return {
        couples,
        rootCouples: rootCouples.length > 0 ? rootCouples : couples.slice(0, Math.min(3, couples.length)),
        personMap
    };
}

function renderFamilyTree(ctx, tree) {
    const { couples, rootCouples } = tree;

    if (couples.length === 0) {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('家系図データがありません', 800, 600);
        return;
    }

    const PERSON_WIDTH = 100;
    const PERSON_HEIGHT = 50;
    const HORIZONTAL_SPACING = 40;
    const VERTICAL_SPACING = 120;
    const COUPLE_SPACING = 20;

    const positions = new Map();
    const couplePositions = new Map();

    function layoutCouple(couple, x, y) {
        const hasHusband = couple.husband !== null;
        const hasWife = couple.wife !== null;

        let coupleWidth = 0;
        let coupleX = x;

        if (hasHusband && hasWife) {
            // 左に妻、右に夫
            coupleWidth = PERSON_WIDTH * 2 + COUPLE_SPACING;
            positions.set(couple.wife.id, { x: coupleX, y });
            positions.set(couple.husband.id, { x: coupleX + PERSON_WIDTH + COUPLE_SPACING, y });
        } else if (hasHusband) {
            coupleWidth = PERSON_WIDTH;
            positions.set(couple.husband.id, { x: coupleX, y });
        } else if (hasWife) {
            coupleWidth = PERSON_WIDTH;
            positions.set(couple.wife.id, { x: coupleX, y });
        }

        couplePositions.set(couple, { x: coupleX, y, width: coupleWidth });

        // 子供を配置（長男/長女が右側）
        if (couple.children.length > 0) {
            const childY = y + VERTICAL_SPACING;
            const totalChildrenWidth = couple.children.length * PERSON_WIDTH +
                (couple.children.length - 1) * HORIZONTAL_SPACING;

            let childX = coupleX + (coupleWidth / 2) - (totalChildrenWidth / 2);

            // 逆順で配置（最年長が右）
            const reversedChildren = [...couple.children].reverse();

            reversedChildren.forEach(child => {
                positions.set(child.id, { x: childX, y: childY });
                childX += PERSON_WIDTH + HORIZONTAL_SPACING;
            });
        }
    }

    let startX = 100;
    rootCouples.forEach((couple) => {
        layoutCouple(couple, startX, 50);
        const couplePos = couplePositions.get(couple);
        startX = couplePos.x + couplePos.width + 150;
    });

    // 線を描画
    couples.forEach(couple => {
        const couplePos = couplePositions.get(couple);
        if (!couplePos) return;

        const hasHusband = couple.husband !== null;
        const hasWife = couple.wife !== null;

        // 夫婦間の線
        if (hasHusband && hasWife) {
            const wifePos = positions.get(couple.wife.id);
            const husbandPos = positions.get(couple.husband.id);

            if (couple.type === 'spouse') {
                // 二重線で引く
                ctx.strokeStyle = '#1e293b';
                ctx.lineWidth = 2;

                const y1 = wifePos.y + PERSON_HEIGHT / 2;
                const x1 = wifePos.x + PERSON_WIDTH;
                const x2 = husbandPos.x;

                ctx.beginPath();
                ctx.moveTo(x1, y1 - 3);
                ctx.lineTo(x2, y1 - 3);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(x1, y1 + 3);
                ctx.lineTo(x2, y1 + 3);
                ctx.stroke();
            } else if (couple.type === 'ex_spouse') {
                // 前妻：一本線で表し
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);

                const y1 = wifePos.y + PERSON_HEIGHT / 2;
                const x1 = wifePos.x + PERSON_WIDTH;
                const x2 = husbandPos.x;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // 親子：両親の中心から一本線で子につなぐ
        if (couple.children.length > 0) {
            const coupleY = couplePos.y + PERSON_HEIGHT;
            const coupleCenterX = couplePos.x + couplePos.width / 2;

            const childY = coupleY + VERTICAL_SPACING - PERSON_HEIGHT;
            const midY = coupleY + (VERTICAL_SPACING - PERSON_HEIGHT) / 2;

            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(coupleCenterX, coupleY);
            ctx.lineTo(coupleCenterX, midY);
            ctx.stroke();

            if (couple.children.length > 1) {
                const firstChildPos = positions.get(couple.children[couple.children.length - 1].id);
                const lastChildPos = positions.get(couple.children[0].id);

                ctx.beginPath();
                ctx.moveTo(firstChildPos.x + PERSON_WIDTH / 2, midY);
                ctx.lineTo(lastChildPos.x + PERSON_WIDTH / 2, midY);
                ctx.stroke();
            }

            couple.children.forEach(child => {
                const childPos = positions.get(child.id);
                const childCenterX = childPos.x + PERSON_WIDTH / 2;

                if (child.is_adopted) {
                    // 養子：縦二重線でつなぐ
                    ctx.beginPath();
                    ctx.moveTo(childCenterX - 3, midY);
                    ctx.lineTo(childCenterX - 3, childPos.y);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(childCenterX + 3, midY);
                    ctx.lineTo(childCenterX + 3, childPos.y);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(childCenterX, midY);
                    ctx.lineTo(childCenterX, childPos.y);
                    ctx.stroke();
                }
            });
        }
    });

    // 人物を描画
    positions.forEach((pos, personId) => {
        const person = persons.find(p => p.id === personId);
        if (!person) return;

        const { x, y } = pos;

        ctx.fillStyle = person.gender === '男性' ? '#dbeafe' : '#fce7f3';
        ctx.fillRect(x, y, PERSON_WIDTH, PERSON_HEIGHT);

        ctx.strokeStyle = person.gender === '男性' ? '#2563eb' : '#ec4899';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, PERSON_WIDTH, PERSON_HEIGHT);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(person.name, x + PERSON_WIDTH / 2, y + PERSON_HEIGHT / 2 + 5);

        // 妻または夫がいない場合は、下線を表示
        const hasSpouse = relationships.some(r =>
            (r.person1_id === person.id || r.person2_id === person.id) &&
            (r.type === 'spouse' || r.type === 'ex_spouse')
        );

        if (!hasSpouse) {
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y + PERSON_HEIGHT + 5);
            ctx.lineTo(x + PERSON_WIDTH, y + PERSON_HEIGHT + 5);
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
