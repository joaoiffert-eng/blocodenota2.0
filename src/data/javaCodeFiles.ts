export interface JavaProjectFile {
  name: string;
  path: string;
  language: 'java' | 'xml' | 'groovy';
  description: string;
  content: string;
}

export const JAVA_PROJECT_FILES: JavaProjectFile[] = [
  {
    name: 'Note.java',
    path: 'app/src/main/java/com/blocodenotas/app/model/Note.java',
    language: 'java',
    description: 'Classe de modelo que representa uma anotação',
    content: `package com.blocodenotas.app.model;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Note implements Serializable {
    private long id;
    private String title;
    private String content;
    private String category; // "estudos", "trabalho", "pessoal"
    private boolean isFavorite;
    private boolean isPinned;
    private boolean isLocked;
    private long createdAt;
    private long updatedAt;

    public Note() {
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
        this.category = "estudos";
        this.isFavorite = false;
        this.isPinned = false;
        this.isLocked = false;
    }

    public Note(String title, String content, String category) {
        this();
        this.title = title;
        this.content = content;
        this.category = category;
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { 
        this.title = title; 
        this.updatedAt = System.currentTimeMillis();
    }

    public String getContent() { return content; }
    public void setContent(String content) { 
        this.content = content; 
        this.updatedAt = System.currentTimeMillis();
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }

    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }

    public String getFormattedDate() {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
        return sdf.format(new Date(this.updatedAt));
    }
}
`,
  },
  {
    name: 'NoteDatabaseHelper.java',
    path: 'app/src/main/java/com/blocodenotas/app/database/NoteDatabaseHelper.java',
    language: 'java',
    description: 'Banco de dados SQLite local para persistência offline das anotações',
    content: `package com.blocodenotas.app.database;

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

    // Buscar todas ou com filtros
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
`,
  },
  {
    name: 'MainActivity.java',
    path: 'app/src/main/java/com/blocodenotas/app/MainActivity.java',
    language: 'java',
    description: 'Tela principal do aplicativo Android com lista de notas, pesquisa e categorias',
    content: `package com.blocodenotas.app;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.blocodenotas.app.adapter.NoteAdapter;
import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;

import java.util.List;

public class MainActivity extends AppCompatActivity implements NoteAdapter.OnNoteClickListener {

    private RecyclerView recyclerView;
    private NoteAdapter adapter;
    private NoteDatabaseHelper dbHelper;
    private EditText etSearch;
    private BottomNavigationView bottomNav;
    private FloatingActionButton fabNewNote;

    private String currentCategory = "todas";
    private boolean isFavoritesOnly = false;
    private String currentSearchText = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        dbHelper = new NoteDatabaseHelper(this);

        initViews();
        setupRecyclerView();
        setupListeners();
        loadNotes();
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewNotes);
        etSearch = findViewById(R.id.etSearch);
        bottomNav = findViewById(R.id.bottomNavigation);
        fabNewNote = findViewById(R.id.fabNewNote);
    }

    private void setupRecyclerView() {
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new NoteAdapter(this, this);
        recyclerView.setAdapter(adapter);
    }

    private void setupListeners() {
        // Nova Anotação
        fabNewNote.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, NoteEditorActivity.class);
            startActivity(intent);
        });

        // Pesquisar em tempo real
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearchText = s.toString();
                loadNotes();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Categorias via Bottom Navigation (Estudos, Trabalho, Pessoal, Favoritos)
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_all) {
                currentCategory = "todas";
                isFavoritesOnly = false;
            } else if (id == R.id.nav_estudos) {
                currentCategory = "estudos";
                isFavoritesOnly = false;
            } else if (id == R.id.nav_trabalho) {
                currentCategory = "trabalho";
                isFavoritesOnly = false;
            } else if (id == R.id.nav_pessoal) {
                currentCategory = "pessoal";
                isFavoritesOnly = false;
            } else if (id == R.id.nav_favorites) {
                currentCategory = "todas";
                isFavoritesOnly = true;
            }
            loadNotes();
            return true;
        });

        // Botão Sair com Diálogo de Confirmação
        findViewById(R.id.btnExit).setOnClickListener(v -> showExitConfirmationDialog());

        // Botão Modo Escuro
        findViewById(R.id.btnToggleTheme).setOnClickListener(v -> toggleDarkMode());
    }

    private void loadNotes() {
        List<Note> notes = dbHelper.getNotes(currentCategory, isFavoritesOnly, currentSearchText);
        adapter.setNotes(notes);
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadNotes();
    }

    @Override
    public void onNoteClick(Note note) {
        // Visualizar Anotação Completa
        Intent intent = new Intent(this, NoteViewerActivity.class);
        intent.putExtra("note_id", note.getId());
        startActivity(intent);
    }

    @Override
    public void onNoteEdit(Note note) {
        // Editar Anotação
        Intent intent = new Intent(this, NoteEditorActivity.class);
        intent.putExtra("note_id", note.getId());
        startActivity(intent);
    }

    @Override
    public void onNoteDelete(Note note) {
        // Excluir com Diálogo de Confirmação
        new AlertDialog.Builder(this)
                .setTitle("Excluir Anotação")
                .setMessage("Tem certeza de que deseja excluir \\"" + note.getTitle() + "\\" ?")
                .setPositiveButton("Excluir", (dialog, which) -> {
                    dbHelper.deleteNote(note.getId());
                    loadNotes();
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    @Override
    public void onNoteFavoriteToggle(Note note) {
        boolean nextState = !note.isFavorite();
        dbHelper.toggleFavorite(note.getId(), nextState);
        loadNotes();
    }

    private void showExitConfirmationDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Sair do Bloco de Notas")
                .setMessage("Deseja realmente sair? Suas anotações estão todas gravadas com segurança no dispositivo.")
                .setPositiveButton("Sair", (dialog, which) -> finish())
                .setNegativeButton("Continuar no App", null)
                .show();
    }

    private void toggleDarkMode() {
        int currentMode = AppCompatDelegate.getDefaultNightMode();
        if (currentMode == AppCompatDelegate.MODE_NIGHT_YES) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        }
    }
}
`,
  },
  {
    name: 'NoteEditorActivity.java',
    path: 'app/src/main/java/com/blocodenotas/app/NoteEditorActivity.java',
    language: 'java',
    description: 'Tela de criação e edição de anotações com botão salvar, voltar e seleção de categoria',
    content: `package com.blocodenotas.app;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioGroup;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;

public class NoteEditorActivity extends AppCompatActivity {

    private EditText etTitle, etContent;
    private RadioGroup rgCategory;
    private Button btnSave, btnBack;
    private NoteDatabaseHelper dbHelper;
    private Note currentNote;
    private boolean isEditing = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_editor);

        dbHelper = new NoteDatabaseHelper(this);
        initViews();

        long noteId = getIntent().getLongExtra("note_id", -1);
        if (noteId != -1) {
            isEditing = true;
            // Carregar nota para edição
            loadNoteData(noteId);
        }

        setupListeners();
    }

    private void initViews() {
        etTitle = findViewById(R.id.etTitle);
        etContent = findViewById(R.id.etContent);
        rgCategory = findViewById(R.id.rgCategory);
        btnSave = findViewById(R.id.btnSave);
        btnBack = findViewById(R.id.btnBack);
    }

    private void loadNoteData(long noteId) {
        // Buscar e preencher
        for (Note n : dbHelper.getNotes("todas", false, "")) {
            if (n.getId() == noteId) {
                currentNote = n;
                etTitle.setText(n.getTitle());
                etContent.setText(n.getContent());
                switch (n.getCategory()) {
                    case "trabalho":
                        rgCategory.check(R.id.rbTrabalho);
                        break;
                    case "pessoal":
                        rgCategory.check(R.id.rbPessoal);
                        break;
                    default:
                        rgCategory.check(R.id.rbEstudos);
                        break;
                }
                break;
            }
        }
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> handleBackWithConfirmation());
        btnSave.setOnClickListener(v -> saveNote());
    }

    private void saveNote() {
        String title = etTitle.getText().toString().trim();
        String content = etContent.getText().toString().trim();

        if (title.isEmpty()) {
            etTitle.setError("Informe um título para salvar a anotação");
            etTitle.requestFocus();
            return;
        }

        String category = "estudos";
        int checkedId = rgCategory.getCheckedRadioButtonId();
        if (checkedId == R.id.rbTrabalho) {
            category = "trabalho";
        } else if (checkedId == R.id.rbPessoal) {
            category = "pessoal";
        }

        if (isEditing && currentNote != null) {
            currentNote.setTitle(title);
            currentNote.setContent(content);
            currentNote.setCategory(category);
            dbHelper.updateNote(currentNote);
            Toast.makeText(this, "Anotação atualizada com sucesso!", Toast.LENGTH_SHORT).show();
        } else {
            Note newNote = new Note(title, content, category);
            dbHelper.insertNote(newNote);
            Toast.makeText(this, "Anotação salva com sucesso!", Toast.LENGTH_SHORT).show();
        }

        finish();
    }

    private void handleBackWithConfirmation() {
        if (!etTitle.getText().toString().trim().isEmpty() || !etContent.getText().toString().trim().isEmpty()) {
            new AlertDialog.Builder(this)
                    .setTitle("Descartar alterações?")
                    .setMessage("Você tem alterações não salvas. Deseja realmente voltar?")
                    .setPositiveButton("Descartar", (dialog, which) -> finish())
                    .setNegativeButton("Continuar Editando", null)
                    .show();
        } else {
            finish();
        }
    }

    @Override
    public void onBackPressed() {
        handleBackWithConfirmation();
    }
}
`,
  },
  {
    name: 'NoteViewerActivity.java',
    path: 'app/src/main/java/com/blocodenotas/app/NoteViewerActivity.java',
    language: 'java',
    description: 'Tela de leitura e visualização completa da anotação com botão copiar, editar e excluir',
    content: `package com.blocodenotas.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;

public class NoteViewerActivity extends AppCompatActivity {

    private TextView tvTitle, tvContent, tvCategory, tvDate;
    private Button btnBack, btnEdit, btnDelete, btnCopy;
    private NoteDatabaseHelper dbHelper;
    private Note currentNote;
    private long noteId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_viewer);

        dbHelper = new NoteDatabaseHelper(this);
        noteId = getIntent().getLongExtra("note_id", -1);

        initViews();
        loadNote();
        setupListeners();
    }

    private void initViews() {
        tvTitle = findViewById(R.id.tvTitle);
        tvContent = findViewById(R.id.tvContent);
        tvCategory = findViewById(R.id.tvCategory);
        tvDate = findViewById(R.id.tvDate);
        btnBack = findViewById(R.id.btnBack);
        btnEdit = findViewById(R.id.btnEdit);
        btnDelete = findViewById(R.id.btnDelete);
        btnCopy = findViewById(R.id.btnCopy);
    }

    private void loadNote() {
        for (Note n : dbHelper.getNotes("todas", false, "")) {
            if (n.getId() == noteId) {
                currentNote = n;
                tvTitle.setText(n.getTitle());
                tvContent.setText(n.getContent());
                tvCategory.setText(n.getCategory().toUpperCase());
                tvDate.setText("Atualizado em " + n.getFormattedDate());
                break;
            }
        }
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());

        btnEdit.setOnClickListener(v -> {
            Intent intent = new Intent(this, NoteEditorActivity.class);
            intent.putExtra("note_id", noteId);
            startActivity(intent);
            finish();
        });

        btnCopy.setOnClickListener(v -> {
            ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText("Anotação", currentNote.getTitle() + "\\n\\n" + currentNote.getContent());
            clipboard.setPrimaryClip(clip);
            Toast.makeText(this, "Conteúdo copiado para a área de transferência!", Toast.LENGTH_SHORT).show();
        });

        btnDelete.setOnClickListener(v -> {
            new AlertDialog.Builder(this)
                    .setTitle("Excluir Anotação")
                    .setMessage("Tem certeza de que deseja remover esta anotação?")
                    .setPositiveButton("Excluir", (dialog, which) -> {
                        dbHelper.deleteNote(noteId);
                        Toast.makeText(this, "Anotação excluída.", Toast.LENGTH_SHORT).show();
                        finish();
                    })
                    .setNegativeButton("Cancelar", null)
                    .show();
        });
    }
}
`,
  },
  {
    name: 'NoteAdapter.java',
    path: 'app/src/main/java/com/blocodenotas/app/adapter/NoteAdapter.java',
    language: 'java',
    description: 'Adapter do RecyclerView que desenha os cartões modernos de anotações',
    content: `package com.blocodenotas.app.adapter;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.card.MaterialCardView;
import com.blocodenotas.app.R;
import com.blocodenotas.app.model.Note;

import java.util.ArrayList;
import java.util.List;

public class NoteAdapter extends RecyclerView.Adapter<NoteAdapter.NoteViewHolder> {

    private final Context context;
    private final OnNoteClickListener listener;
    private List<Note> notes = new ArrayList<>();

    public interface OnNoteClickListener {
        void onNoteClick(Note note);
        void onNoteEdit(Note note);
        void onNoteDelete(Note note);
        void onNoteFavoriteToggle(Note note);
    }

    public NoteAdapter(Context context, OnNoteClickListener listener) {
        this.context = context;
        this.listener = listener;
    }

    public void setNotes(List<Note> notes) {
        this.notes = notes;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public NoteViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_note, parent, false);
        return new NoteViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull NoteViewHolder holder, int position) {
        Note note = notes.get(position);
        holder.tvTitle.setText(note.getTitle());
        holder.tvContentPreview.setText(note.getContent());
        holder.tvDate.setText(note.getFormattedDate());
        holder.tvCategory.setText(note.getCategory().toUpperCase());

        // Paleta de Cores: Azul (Estudos), Verde (Trabalho), Lilás (Pessoal)
        if ("estudos".equalsIgnoreCase(note.getCategory())) {
            holder.tvCategory.setBackgroundColor(Color.parseColor("#DBEAFE")); // Azul suave
            holder.tvCategory.setTextColor(Color.parseColor("#1E40AF"));
        } else if ("trabalho".equalsIgnoreCase(note.getCategory())) {
            holder.tvCategory.setBackgroundColor(Color.parseColor("#D1FAE5")); // Verde esmeralda
            holder.tvCategory.setTextColor(Color.parseColor("#065F46"));
        } else {
            holder.tvCategory.setBackgroundColor(Color.parseColor("#EDE9FE")); // Lilás suave
            holder.tvCategory.setTextColor(Color.parseColor("#5B21B6"));
        }

        // Ícone de favorito
        if (note.isFavorite()) {
            holder.btnFavorite.setImageResource(android.R.drawable.star_big_on);
        } else {
            holder.btnFavorite.setImageResource(android.R.drawable.star_big_off);
        }

        holder.cardView.setOnClickListener(v -> listener.onNoteClick(note));
        holder.btnFavorite.setOnClickListener(v -> listener.onNoteFavoriteToggle(note));
        holder.btnEdit.setOnClickListener(v -> listener.onNoteEdit(note));
        holder.btnDelete.setOnClickListener(v -> listener.onNoteDelete(note));
    }

    @Override
    public int getItemCount() {
        return notes.size();
    }

    static class NoteViewHolder extends RecyclerView.ViewHolder {
        MaterialCardView cardView;
        TextView tvTitle, tvContentPreview, tvCategory, tvDate;
        ImageButton btnFavorite, btnEdit, btnDelete;

        public NoteViewHolder(@NonNull View itemView) {
            super(itemView);
            cardView = itemView.findViewById(R.id.cardView);
            tvTitle = itemView.findViewById(R.id.tvTitle);
            tvContentPreview = itemView.findViewById(R.id.tvContentPreview);
            tvCategory = itemView.findViewById(R.id.tvCategory);
            tvDate = itemView.findViewById(R.id.tvDate);
            btnFavorite = itemView.findViewById(R.id.btnFavorite);
            btnEdit = itemView.findViewById(R.id.btnEdit);
            btnDelete = itemView.findViewById(R.id.btnDelete);
        }
    }
}
`,
  },
  {
    name: 'activity_main.xml',
    path: 'app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    description: 'Layout da tela principal com barra de pesquisa, cards e barra de navegação inferior',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#F8FAFC">

    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="#FFFFFF"
        app:elevation="2dp">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:padding="16dp"
            android:gravity="center_vertical">

            <TextView
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Bloco de Notas"
                android:textSize="20sp"
                android:textStyle="bold"
                android:textColor="#0F172A" />

            <ImageButton
                android:id="@+id/btnToggleTheme"
                android:layout_width="40dp"
                android:layout_height="40dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:src="@android:drawable/ic_menu_day"
                android:contentDescription="Modo Escuro" />

            <ImageButton
                android:id="@+id/btnExit"
                android:layout_width="40dp"
                android:layout_height="40dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:src="@android:drawable/ic_lock_power_off"
                android:contentDescription="Sair" />
        </LinearLayout>

        <!-- Barra de Pesquisa -->
        <EditText
            android:id="@+id/etSearch"
            android:layout_width="match_parent"
            android:layout_height="48dp"
            android:layout_marginHorizontal="16dp"
            android:layout_marginBottom="12dp"
            android:background="@drawable/bg_search_input"
            android:drawableStart="@android:drawable/ic_menu_search"
            android:drawablePadding="12dp"
            android:hint="Pesquisar por título ou conteúdo..."
            android:paddingHorizontal="16dp"
            android:textSize="14sp" />

    </com.google.android.material.appbar.AppBarLayout>

    <!-- Lista de Anotações -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/recyclerViewNotes"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:padding="12dp"
        android:clipToPadding="false"
        app:layout_behavior="@string/appbar_scrolling_view_behavior" />

    <!-- Botão Flutuante: Nova Anotação -->
    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fabNewNote"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom|end"
        android:layout_margin="24dp"
        android:layout_marginBottom="80dp"
        android:backgroundTint="#2563EB"
        android:src="@android:drawable/ic_input_add"
        app:tint="#FFFFFF"
        android:contentDescription="Nova Anotação" />

    <!-- Navegação Inferior de Categorias -->
    <com.google.android.material.bottomnavigation.BottomNavigationView
        android:id="@+id/bottomNavigation"
        android:layout_width="match_parent"
        android:layout_height="64dp"
        android:layout_gravity="bottom"
        android:background="#FFFFFF"
        app:menu="@menu/bottom_nav_menu" />

</androidx.coordinatorlayout.widget.CoordinatorLayout>
`,
  },
  {
    name: 'item_note.xml',
    path: 'app/src/main/res/layout/item_note.xml',
    language: 'xml',
    description: 'Layout moderno dos cartões de notas com cantos arredondados e botões suaves',
    content: `<?xml version="1.0" encoding="utf-8"?>
<com.google.android.material.card.MaterialCardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:id="@+id/cardView"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginVertical="6dp"
    android:clickable="true"
    android:focusable="true"
    app:cardCornerRadius="18dp"
    app:cardElevation="2dp"
    app:strokeColor="#E2E8F0"
    app:strokeWidth="1dp"
    app:cardBackgroundColor="#FFFFFF">

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical">

            <!-- Tag de Categoria com cantos arredondados -->
            <TextView
                android:id="@+id/tvCategory"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="ESTUDOS"
                android:paddingHorizontal="10dp"
                android:paddingVertical="3dp"
                android:textSize="11sp"
                android:textStyle="bold"
                android:background="#DBEAFE"
                android:textColor="#1E40AF" />

            <View
                android:layout_width="0dp"
                android:layout_height="0dp"
                android:layout_weight="1" />

            <ImageButton
                android:id="@+id/btnFavorite"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:src="@android:drawable/star_big_off" />
        </LinearLayout>

        <TextView
            android:id="@+id/tvTitle"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="Título da Anotação"
            android:textSize="16sp"
            android:textStyle="bold"
            android:textColor="#0F172A" />

        <TextView
            android:id="@+id/tvContentPreview"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:maxLines="3"
            android:ellipsize="end"
            android:text="Prévia do conteúdo detalhado da anotação com leitura agradável e contraste ideal..."
            android:textSize="13sp"
            android:textColor="#64748B" />

        <View
            android:layout_width="match_parent"
            android:layout_height="1dp"
            android:layout_marginTop="12dp"
            android:background="#F1F5F9" />

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:orientation="horizontal"
            android:gravity="center_vertical">

            <TextView
                android:id="@+id/tvDate"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="16/10/2026 10:30"
                android:textSize="12sp"
                android:textColor="#94A3B8" />

            <ImageButton
                android:id="@+id/btnEdit"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:src="@android:drawable/ic_menu_edit" />

            <ImageButton
                android:id="@+id/btnDelete"
                android:layout_width="32dp"
                android:layout_height="32dp"
                android:background="?attr/selectableItemBackgroundBorderless"
                android:src="@android:drawable/ic_menu_delete" />
        </LinearLayout>

    </LinearLayout>
</com.google.android.material.card.MaterialCardView>
`,
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Manifesto da aplicação Android',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.blocodenotas.app">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Bloco de Notas"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MaterialComponents.DayNight.NoActionBar">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".NoteEditorActivity"
            android:label="Editar Anotação" />

        <activity
            android:name=".NoteViewerActivity"
            android:label="Visualizar Anotação" />

    </application>

</manifest>
`,
  },
  {
    name: 'build.gradle',
    path: 'app/build.gradle',
    language: 'groovy',
    description: 'Configuração do Gradle para compilação no Android Studio',
    content: `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.blocodenotas.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.blocodenotas.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
    implementation 'androidx.cardview:cardview:1.0.0'
}
`,
  },
];
