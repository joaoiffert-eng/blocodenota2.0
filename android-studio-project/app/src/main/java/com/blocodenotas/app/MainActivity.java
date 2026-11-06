package com.blocodenotas.app;

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
                .setMessage("Tem certeza de que deseja excluir \"" + note.getTitle() + "\" ?")
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
