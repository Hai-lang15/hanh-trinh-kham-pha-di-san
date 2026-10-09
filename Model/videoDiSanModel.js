const db = require("../config/database");

const getByDiSanId = (diSanId, callback) => {
    const sql = `
        SELECT *
        FROM video_di_san
        WHERE di_san_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [diSanId], callback);
};

const create = (data, callback) => {
    const sql = `
        INSERT INTO video_di_san
        (di_san_id, duong_dan, tieu_de, mo_ta)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            data.di_san_id,
            data.duong_dan,
            data.tieu_de,
            data.mo_ta || null
        ],
        callback
    );
};

const remove = (id, callback) => {
    const sql = `
        DELETE FROM video_di_san
        WHERE id = ?
    `;

    db.query(sql, [id], callback);
};

const removeByDiSanId = (diSanId, callback) => {
    const sql = `
        DELETE FROM video_di_san
        WHERE di_san_id = ?
    `;

    db.query(sql, [diSanId], callback);
};

module.exports = {
    getByDiSanId,
    create,
    remove,
    removeByDiSanId
};