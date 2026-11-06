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

        // Inserir anotações de exemplo em português
        insertSample(db, "Resumo de Biologia: Estrutura Celular", 
                "Principais conceitos para a prova:\n1. Membrana Plasmática: bicamada lipídica com permeabilidade seletiva.\n2. Mitocôndrias: respiração celular e síntese de ATP.\n3. Retículo Endoplasmático e Golgi: síntese e secreção de proteínas.\n\nRevisar ciclo de Krebs!", 
                "estudos", 1, 1);

        insertSample(db, "Planejamento do Projeto Q4", 
                "Metas da semana:\n[X] Definição da paleta moderna (Azul, Verde e Lilás)\n[X] Implementação da navegação mobile\n[ ] Testes no Android Studio\n[ ] Apresentação com a equipe", 
                "trabalho", 1, 0);

        insertSample(db, "Lista de Livros & Desenvolvimento", 
                "Livros recomendados:\n- Hábitos Atômicos (James Clear)\n- O Homem que Calculava (Malba Tahan)\n\nMeta diária: 20 páginas antes de dormir.", 
                "pessoal", 0, 0);
    }

    private void insertSample(SQLiteDatabase db, String title, String content, String category, int fav, int pinned) {
        ContentValues cv = new ContentValues();
        cv.put(COLUMN_TITLE, title);
        cv.put(COLUMN_CONTENT, content);
        cv.put(COLUMN_CATEGORY, category);
        cv.put(COLUMN_IS_FAVORITE, fav);
        cv.put(COLUMN_IS_PINNED, pinned);
        cv.put(COLUMN_CREATED_AT, System.currentTimeMillis());
        cv.put(COLUMN_UPDATED_AT, System.currentTimeMillis());
        db.insert(TABLE_NOTES, null, cv);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_NOTES);
        onCreate(db);
    }

    // Inserir Nova Anotação (Salvar)
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

    // Atualizar Anotação Existente (Editar)
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

    // Excluir Anotação
    public void deleteNote(long id) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_NOTES, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }

    // Alternar Favorito
    public void toggleFavorite(long id, boolean isFavorite) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COLUMN_IS_FAVORITE, isFavorite ? 1 : 0);
        db.update(TABLE_NOTES, values, COLUMN_ID + " = ?", new String[]{String.valueOf(id)});
        db.close();
    }

    // Buscar com Filtro e Pesquisa
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
            args.add("%" + searchQuery + "%");
            args.add("%" + searchQuery + "%");
        }

        query.append(" ORDER BY ").append(COLUMN_IS_PINNED).append(" DESC, ")
             .append(COLUMN_UPDATED_AT).append(" DESC");

        Cursor cursor = db.rawQuery(query.toString(), args.toArray(new String[0]));

        if (cursor.moveToFirst()) {
            do {
                Note note = new Note();
                note.setId(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_ID)));
                note.setTitle(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TITLE)));
                note.setContent(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_CONTENT)));
                note.setCategory(cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_CATEGORY)));
                note.setFavorite(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_IS_FAVORITE)) == 1);
                note.setPinned(cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_IS_PINNED)) == 1);
                note.setCreatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_CREATED_AT)));
                note.setUpdatedAt(cursor.getLong(cursor.getColumnIndexOrThrow(COLUMN_UPDATED_AT)));
                list.add(note);
            } while (cursor.moveToNext());
        }

        cursor.close();
        db.close();
        return list;
    }
}
