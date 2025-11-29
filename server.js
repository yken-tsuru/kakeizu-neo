const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const { format } = require('fast-csv');
const { Person, Relationship, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
initDatabase();

// API Routes

// Get all persons
app.get('/api/persons', async (req, res) => {
    try {
        const persons = await Person.findAll();
        res.json(persons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all relationships
app.get('/api/relationships', async (req, res) => {
    try {
        const relationships = await Relationship.findAll();
        res.json(relationships);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get full family tree data
app.get('/api/family', async (req, res) => {
    try {
        const persons = await Person.findAll();
        const relationships = await Relationship.findAll();
        res.json({ persons, relationships });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or update person
app.post('/api/person', async (req, res) => {
    try {
        const { id, name, gender, birth_date, death_date, is_adopted, notes } = req.body;

        if (id) {
            // Update existing person
            const person = await Person.findByPk(id);
            if (!person) {
                return res.status(404).json({ error: '人物が見つかりません' });
            }
            await person.update({ name, gender, birth_date, death_date, is_adopted, notes });
            res.json(person);
        } else {
            // Create new person
            const person = await Person.create({ name, gender, birth_date, death_date, is_adopted, notes });
            res.json(person);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete person
app.delete('/api/person/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete related relationships first
        await Relationship.destroy({
            where: {
                [require('sequelize').Op.or]: [
                    { person1_id: id },
                    { person2_id: id }
                ]
            }
        });

        // Delete person
        const person = await Person.findByPk(id);
        if (!person) {
            return res.status(404).json({ error: '人物が見つかりません' });
        }
        await person.destroy();
        res.json({ message: '削除しました' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create relationship
app.post('/api/relationship', async (req, res) => {
    try {
        const { person1_id, person2_id, type } = req.body;
        const relationship = await Relationship.create({ person1_id, person2_id, type });
        res.json(relationship);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete relationship
app.delete('/api/relationship/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const relationship = await Relationship.findByPk(id);
        if (!relationship) {
            return res.status(404).json({ error: '関係が見つかりません' });
        }
        await relationship.destroy();
        res.json({ message: '削除しました' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import CSV
app.post('/api/import/csv', async (req, res) => {
    try {
        const { csvData } = req.body;

        if (!csvData) {
            return res.status(400).json({ error: 'CSVデータが必要です' });
        }

        // Parse CSV data
        const rows = [];
        const stream = require('stream');
        const readable = new stream.Readable();
        readable.push(csvData);
        readable.push(null);

        readable
            .pipe(csv())
            .on('data', (row) => rows.push(row))
            .on('end', async () => {
                try {
                    // Import persons
                    for (const row of rows) {
                        await Person.create({
                            name: row.name || row['名前'],
                            gender: row.gender || row['性別'],
                            birth_date: row.birth_date || row['生年月日'],
                            death_date: row.death_date || row['没年月日'],
                            is_adopted: row.is_adopted === 'true' || row['養子'] === 'true',
                            notes: row.notes || row['備考']
                        });
                    }
                    res.json({ message: `${rows.length}件のデータをインポートしました` });
                } catch (error) {
                    res.status(500).json({ error: error.message });
                }
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Import JSON
app.post('/api/import/json', async (req, res) => {
    try {
        const { persons, relationships } = req.body;

        if (!persons || !Array.isArray(persons)) {
            return res.status(400).json({ error: '無効なJSONデータです' });
        }

        // Import persons
        for (const personData of persons) {
            await Person.create(personData);
        }

        // Import relationships if provided
        if (relationships && Array.isArray(relationships)) {
            for (const relData of relationships) {
                await Relationship.create(relData);
            }
        }

        res.json({ message: `${persons.length}件のデータをインポートしました` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export CSV
app.get('/api/export/csv', async (req, res) => {
    try {
        const persons = await Person.findAll();

        const csvStream = format({ headers: true });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=family_tree.csv');

        csvStream.pipe(res);

        persons.forEach(person => {
            csvStream.write({
                id: person.id,
                名前: person.name,
                性別: person.gender,
                生年月日: person.birth_date,
                没年月日: person.death_date,
                養子: person.is_adopted,
                備考: person.notes
            });
        });

        csvStream.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export JSON
app.get('/api/export/json', async (req, res) => {
    try {
        const persons = await Person.findAll();
        const relationships = await Relationship.findAll();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=family_tree.json');
        res.json({ persons, relationships });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
