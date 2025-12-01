// Family Tree Visualization
// Ported from original app.js

// Global function to draw the family tree
function drawFamilyTree() {
    const canvas = document.getElementById('family-tree-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    canvas.width = 1600;
    canvas.height = 1200;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const displayPersons = window.persons || [];
    const displayRelationships = window.relationships || [];

    if (displayPersons.length === 0) {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText('データがありません', canvas.width / 2, canvas.height / 2);
        return;
    }

    const tree = buildFamilyTreeStructure(displayPersons, displayRelationships);
    renderFamilyTree(ctx, tree, displayPersons, displayRelationships);
}

function buildFamilyTreeStructure(displayPersons, displayRelationships) {
    const personMap = new Map();
    displayPersons.forEach(p => personMap.set(p.id, p));

    // 夫婦を見つける
    const couples = [];
    const processedRels = new Set();

    displayRelationships.forEach(rel => {
        if ((rel.relationship_type === 'spouse' || rel.relationship_type === 'ex_spouse') && !processedRels.has(rel.id)) {
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
                    type: rel.relationship_type,
                    children: []
                });
                processedRels.add(rel.id);
            }
        }
    });

    // 親子関係を見つける
    const childParentMap = new Map();
    displayRelationships.forEach(rel => {
        if (rel.relationship_type === 'parent_child') {
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

function renderFamilyTree(ctx, tree, displayPersons, displayRelationships) {
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
        const person = displayPersons.find(p => p.id === personId);
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
        const hasSpouse = displayRelationships.some(r =>
            (r.person1_id === person.id || r.person2_id === person.id) &&
            (r.relationship_type === 'spouse' || r.relationship_type === 'ex_spouse')
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

// Make drawFamilyTree available globally
window.drawFamilyTree = drawFamilyTree;
