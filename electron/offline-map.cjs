const { DatabaseSync } = require('node:sqlite');
class OfflineMap {
  constructor(file) {
    this.db = new DatabaseSync(file, { readOnly: true, allowExtension: false });
    try {
      this.metadata = Object.fromEntries(this.db.prepare('SELECT name,value FROM metadata').all().map(row => [row.name, row.value]));
      if (!['png', 'jpg', 'jpeg', 'webp'].includes(this.metadata.format)) throw new Error('Wymagany raster MBTiles PNG/JPEG/WebP');
      if (!this.db.prepare('SELECT 1 FROM tiles LIMIT 1').get()) throw new Error('Pakiet nie zawiera kafelków');
      this.query = this.db.prepare('SELECT tile_data FROM tiles WHERE zoom_level=? AND tile_column=? AND tile_row=? LIMIT 1');
    } catch (error) { this.db.close(); throw error; }
  }
  tile(z, x, y) {
    if (![z, x, y].every(Number.isInteger) || z < 0 || z > 22 || x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) throw new Error('Nieprawidłowe współrzędne kafelka');
    const row = this.query.get(z, x, 2 ** z - 1 - y);
    return row ? Buffer.from(row.tile_data) : null;
  }
  close() { this.db.close(); }
}
module.exports = { OfflineMap };
