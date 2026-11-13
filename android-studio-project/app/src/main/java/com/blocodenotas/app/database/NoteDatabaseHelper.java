package com.blocodenotas.app.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import com.blocodenotas.app.model.Note;

import java.util.ArrayList;
import java.util.List;

public class NoteDatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "bloco_de_notas.db";
    private static final int DATABASE_VERSION = 1;

    public static final String TABLE_NOTES = "notes";
    public static final String COLUMN_ID = "_id";
    public static final String COLUMN_TITLE = "title";
    public static final String COLUMN_CONTENT = "content";
    public static final String COLUMN_CATEGORY = "category";
    public static final String COLUMN_IS_FAVORITE = "is_favorite";
    public static final String COLUMN_IS_PINNED = "is_pinned";
    public static final String COLUMN_CREATED_AT = "created_at";
    public static final String COLUMN_UPDATED_AT = "updated_at";

    private static final String TABLE_CREATE =
            "CREATE TABLE " + TABLE_NOTES + " (" +
                    COLUMN_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    COLUMN_TITLE + " TEXT NOT NULL, " +
                    COLUMN_CONTENT + " TEXT, " +
                    COLUMN_CATEGORY + " TEXT DEFAULT 'estudos', " +
                    COLUMN_IS_FAVORITE + " INTEGER DEFAULT 0, " +
                    COLUMN_IS_PINNED + " INTEGER DEFAULT 0, " +
                    COLUMN_CREATED_AT + " INTEGER, " +
                    COLUMN_UPDATED_AT + " INTEGER);";

    public NoteDatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL(TABLE_CREATE);

        long now = System.currentTimeMillis();
        insertSample(db,
                "Resumo de Biologia: Estrutura e Função Celular",
                "Principais conceitos para a prova da próxima semana:\n\n" +
                        "1. Membrana Plasmática:\n" +
                        "   • Bicamada fosfolipídica com proteínas integradas.\n" +
                        "   • Permeabilidade seletiva (transporte passivo vs. ativo).\n\n" +
                        "2. Mitocôndrias:\n" +
                        "   • Respiração celular e geração de ATP (energia).\n" +
                        "   • Possuem DNA próprio.\n\n" +
                        "3. Retículo Endoplasmático e Complexo de Golgi:\n" +
                        "   • RER: síntese de proteínas.\n" +
                        "   • Golgi: empacotamento e secreção celular.\n\n" +
                        "📌 Dica do professor: revisar o ciclo de Krebs!",
                "estudos", 1, 1, now - 3600000L * 4);

        insertSample(db,
                "Planejamento do Projeto: Lançamento Q4",
                "Metas e entregáveis prioritários para a equipe:\n\n" +
                        "[✓] Alinhamento inicial de escopo com a equipe\n" +
                        "[✓] Validação dos requisitos de acessibilidade e usabilidade\n" +
                        "[ ] Desenho da interface com paleta moderna (azul, verde e lilás)\n" +
                        "[ ] Revisão de desempenho e testes offline\n" +
                        "[ ] Apresentação na sexta-feira às 14h",
                "trabalho", 1, 0, now - 3600000L * 8);

        insertSample(db,
                "Livros para Ler & Hábitos Saudáveis",
                "Minha lista de desenvolvimento pessoal:\n\n" +
                        "📚 Leituras recomendadas:\n" +
                        "• \"Hábitos Atômicos\" – James Clear\n" +
                        "• \"O Homem que Calculava\" – Malba Tahan\n" +
                        "• \"Essencialismo\" – Greg McKeown\n\n" +
                        "🌿 Hábitos diários:\n" +
                        "1. Tomar 2,5 litros de água.\n" +
                        "2. Caminhada matinal de 30 minutos.\n" +
                        "3. 15 minutos de leitura antes de dormir.",
                "pessoal", 0, 0, now - 3600000L * 24);
    }

    private void insertSample(SQLiteDatabase db, String title, String content, String category,
                              int isFavorite, int isPinned, long timestamp) {
        ContentValues cv = new ContentValues();
        cv.put(COLUMN_TITLE, title);
        cv.put(COLUMN_CONTENT, content);
        cv.put(COLUMN_CATEGORY, category);
        cv.put(COLUMN_IS_FAVORITE, isFavorite);
        cv.put(COLUMN_IS_PINNED, isPinned);
        cv.put(COLUMN_CREATED_AT, timestamp);
        cv.put(COLUMN_UPDATED_AT, timestamp);
        db.insert(TABLE_NOTES, null, cv);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_NOTES);
        onCreate(db);
    }

    public long insertNote(Note note) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_TITLE, note.getTitle());
        values.put(COLUMN_CONTENT, note.getContent());
        values.put(COLUMN_CATEGORY, note.getCategory());
        values.put(COLUMN_IS_FAVORITE, note.isFavorite() ? 1 : 0);
        values.put(COLUMN_IS_PINNED, note.isPinned() ? 1 : 0);
        values.put(COLUMN_CREATED_AT, note.getCreatedAt());
        values.put(COLUMN_UPDATED_AT, note.getUpdatedAt());

        long id = db.insert(TABLE_NOTES, null, values);
        note.setId(id);
        db.close();
        return id;
    }

    public int updateNote(Note note) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_TITLE, note.getTitle());
        values.put(COLUMN_CONTENT, note.getContent());
        values.put(COLUMN_CATEGORY, note.getCategory());
        values.put(COLUMN_IS_FAVORITE, note.isFavorite() ? 1 : 0);
        values.put(COLUMN_IS_PINNED, note.isPinned() ? 1 : 0);
        values.put(COLUMN_UPDATED_AT, System.currentTimeMillis());

        int rows = db.update(TABLE_NOTES, values, COLUMN_ID + " = ?",
                new String[]{String.valueOf(note.getId())});
        db.close();
        return rows;
    }

    public void deleteNote(long id) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_NOTES, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }

    public void toggleFavorite(long id, boolean isFavorite) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_IS_FAVORITE, isFavorite ? 1 : 0);
        values.put(COLUMN_UPDATED_AT, System.currentTimeMillis());
        db.update(TABLE_NOTES, values, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }

    public void togglePin(long id, boolean isPinned) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_IS_PINNED, isPinned ? 1 : 0);
        values.put(COLUMN_UPDATED_AT, System.currentTimeMillis());
        db.update(TABLE_NOTES, values, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }

    public Note getNoteById(long id) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.query(TABLE_NOTES, null, COLUMN_ID + " = ?",
                new String[]{String.valueOf(id)}, null, null, null);
        Note note = null;
        if (cursor != null) {
            if (cursor.moveToFirst()) {
                note = cursorToNote(cursor);
            }
            cursor.close();
        }
        db.close();
        return note;
    }

    public List<Note> getNotes(String categoryFilter, boolean onlyFavorites, String searchQuery) {
        List<Note> list = new ArrayList<>();
        SQLiteDatabase db = this.getReadableDatabase();

        StringBuilder query = new StringBuilder("SELECT * FROM " + TABLE_NOTES + " WHERE 1=1");
        List<String> args = new ArrayList<>();

        if (onlyFavorites) {
            query.append(" AND ").append(COLUMN_IS_FAVORITE).append(" = 1");
        } else if (categoryFilter != null && !categoryFilter.equals("todas")) {
            query.append(" AND ").append(COLUMN_CATEGORY).append(" = ?");
            args.add(categoryFilter);
        }

        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            query.append(" AND (").append(COLUMN_TITLE).append(" LIKE ? OR ")
                    .append(COLUMN_CONTENT).append(" LIKE ?)");
            String pattern = "%" + searchQuery.trim() + "%";
            args.add(pattern);
            args.add(pattern);
        }

        query.append(" ORDER BY ").append(COLUMN_IS_PINNED).append(" DESC, ")
                .append(COLUMN_UPDATED_AT).append(" DESC");

        Cursor cursor = db.rawQuery(query.toString(), args.toArray(new String[0]));

        if (cursor.moveToFirst()) {
            do {
                list.add(cursorToNote(cursor));
            } while (cursor.moveToNext());
        }

        cursor.close();
        db.close();
        return list;
    }

    public int getTotalCount() {
        return getCount("SELECT COUNT(*) FROM " + TABLE_NOTES, null);
    }

    public int getCategoryCount(String category) {
        return getCount("SELECT COUNT(*) FROM " + TABLE_NOTES + " WHERE " + COLUMN_CATEGORY + " = ?",
                new String[]{category});
    }

    public int getFavoritesCount() {
        return getCount("SELECT COUNT(*) FROM " + TABLE_NOTES + " WHERE " + COLUMN_IS_FAVORITE + " = 1", null);
    }

    private int getCount(String sql, String[] args) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery(sql, args);
        int count = 0;
        if (cursor.moveToFirst()) {
            count = cursor.getInt(0);
        }
        cursor.close();
        db.close();
        return count;
    }

    private Note cursorToNote(Cursor cursor) {
        Note note = new Note();
        note.setId(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ID)));
        note.setTitle(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TITLE)));
        note.setContent(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_CONTENT)));
        note.setCategory(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_CATEGORY)));
        note.setFavorite(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_IS_FAVORITE)) == 1);
        note.setPinned(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_IS_PINNED)) == 1);
        note.setCreatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_CREATED_AT)));
        note.setUpdatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_UPDATED_AT)));
        return note;
    }
}
