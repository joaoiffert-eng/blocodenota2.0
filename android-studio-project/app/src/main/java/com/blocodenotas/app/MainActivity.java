package com.blocodenotas.app;

import android.content.Intent;
import android.content.res.ColorStateList;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.view.ViewCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.blocodenotas.app.adapter.NoteAdapter;
import com.blocodenotas.app.database.NoteDatabaseHelper;
import com.blocodenotas.app.model.Note;
import com.blocodenotas.app.utils.PrefsManager;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.List;

public class MainActivity extends AppCompatActivity implements NoteAdapter.OnNoteClickListener {

    private RecyclerView recyclerView;
    private NoteAdapter adapter;
    private NoteDatabaseHelper dbHelper;
    private EditText etSearch;
    private ImageButton btnClearSearch, btnToggleTheme, btnTextSize, btnExit;
    private LinearLayout emptyStateView;
    private TextView tvEmptyTitle, tvEmptySubtitle;
    private FloatingActionButton fabNewNote;

    // Botões de navegação inferior (apenas nomes e contadores, sem ícones)
    private TextView tabAll, tabStudies, tabWork, tabPersonal, tabFavorites;

    private String currentCategory = "todas";
    private boolean isFavoritesOnly = false;
    private String currentSearchText = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        PrefsManager.applySavedTheme(this);
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        dbHelper = new NoteDatabaseHelper(this);

        initViews();
        setupRecyclerView();
        setupListeners();
        updateThemeIcon();
        loadNotes();

        // Interceptar botão voltar do sistema para confirmar saída
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                showExitConfirmationDialog();
            }
        });
    }

    private void initViews() {
        recyclerView = findViewById(R.id.recyclerViewNotes);
        etSearch = findViewById(R.id.etSearch);
        btnClearSearch = findViewById(R.id.btnClearSearch);
        btnToggleTheme = findViewById(R.id.btnToggleTheme);
        btnTextSize = findViewById(R.id.btnTextSize);
        btnExit = findViewById(R.id.btnExit);
        emptyStateView = findViewById(R.id.emptyStateView);
        tvEmptyTitle = findViewById(R.id.tvEmptyTitle);
        tvEmptySubtitle = findViewById(R.id.tvEmptySubtitle);
        fabNewNote = findViewById(R.id.fabNewNote);

        tabAll = findViewById(R.id.tabAll);
        tabStudies = findViewById(R.id.tabStudies);
        tabWork = findViewById(R.id.tabWork);
        tabPersonal = findViewById(R.id.tabPersonal);
        tabFavorites = findViewById(R.id.tabFavorites);
    }

    private void setupRecyclerView() {
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new NoteAdapter(this, this);
        recyclerView.setAdapter(adapter);
    }

    private void setupListeners() {
        // Botão Flutuante: Nova Anotação
        fabNewNote.setOnClickListener(v -> {
            Intent intent = new Intent(MainActivity.this, NoteEditorActivity.class);
            startActivity(intent);
        });

        // Pesquisa em tempo real
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearchText = s.toString();
                btnClearSearch.setVisibility(currentSearchText.isEmpty() ? View.GONE : View.VISIBLE);
                loadNotes();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        btnClearSearch.setOnClickListener(v -> etSearch.setText(""));

        // Navegação inferior por categorias (somente nomes)
        tabAll.setOnClickListener(v -> selectFilter("todas", false));
        tabStudies.setOnClickListener(v -> selectFilter("estudos", false));
        tabWork.setOnClickListener(v -> selectFilter("trabalho", false));
        tabPersonal.setOnClickListener(v -> selectFilter("pessoal", false));
        tabFavorites.setOnClickListener(v -> selectFilter("todas", true));

        // Alternar Tamanho de Fonte (Acessibilidade)
        btnTextSize.setOnClickListener(v -> {
            int level = PrefsManager.cycleTextSizeLevel(this);
            String label = level == 1 ? "Texto ampliado (Grande)"
                    : level == 2 ? "Texto ampliado (Extra Grande)"
                    : "Tamanho normal de texto";
            Toast.makeText(this, label, Toast.LENGTH_SHORT).show();
            adapter.notifyDataSetChanged();
        });

        // Alternar Modo Escuro
        btnToggleTheme.setOnClickListener(v -> {
            boolean nextDark = !PrefsManager.isDarkMode(this);
            PrefsManager.setDarkMode(this, nextDark);
            Toast.makeText(this, nextDark ? "Modo escuro ativado" : "Modo claro ativado", Toast.LENGTH_SHORT).show();
        });

        // Sair com confirmação
        btnExit.setOnClickListener(v -> showExitConfirmationDialog());
    }

    private void selectFilter(String category, boolean favoritesOnly) {
        currentCategory = category;
        isFavoritesOnly = favoritesOnly;
        loadNotes();
    }

    private void updateThemeIcon() {
        boolean isDark = PrefsManager.isDarkMode(this);
        btnToggleTheme.setImageResource(isDark ? R.drawable.ic_sun : R.drawable.ic_moon);
        btnToggleTheme.setColorFilter(ContextCompat.getColor(this,
                isDark ? R.color.favorite_yellow : R.color.personal_purple));
    }

    private void loadNotes() {
        List<Note> notes = dbHelper.getNotes(currentCategory, isFavoritesOnly, currentSearchText);
        adapter.setNotes(notes);
        updateCategoryTabs();

        if (notes.isEmpty()) {
            recyclerView.setVisibility(View.GONE);
            emptyStateView.setVisibility(View.VISIBLE);
            if (!currentSearchText.trim().isEmpty()) {
                tvEmptyTitle.setText("Nenhum resultado encontrado");
                tvEmptySubtitle.setText("Tente buscar por outra palavra ou limpe a pesquisa.");
            } else if (isFavoritesOnly) {
                tvEmptyTitle.setText("Sem favoritos ainda");
                tvEmptySubtitle.setText("Toque na estrela ★ de uma anotação para marcá-la aqui.");
            } else {
                tvEmptyTitle.setText("Nenhuma anotação por aqui");
                tvEmptySubtitle.setText("Toque no botão + para criar sua primeira anotação!");
            }
        } else {
            recyclerView.setVisibility(View.VISIBLE);
            emptyStateView.setVisibility(View.GONE);
        }
    }

    private void updateCategoryTabs() {
        int allCount = dbHelper.getTotalCount();
        int studiesCount = dbHelper.getCategoryCount("estudos");
        int workCount = dbHelper.getCategoryCount("trabalho");
        int personalCount = dbHelper.getCategoryCount("pessoal");
        int favCount = dbHelper.getFavoritesCount();

        tabAll.setText("Início (" + allCount + ")");
        tabStudies.setText("Estudos (" + studiesCount + ")");
        tabWork.setText("Trabalho (" + workCount + ")");
        tabPersonal.setText("Pessoal (" + personalCount + ")");
        tabFavorites.setText("Favoritos (" + favCount + ")");

        styleTab(tabAll, !isFavoritesOnly && currentCategory.equals("todas"), R.color.tab_all_active);
        styleTab(tabStudies, !isFavoritesOnly && currentCategory.equals("estudos"), R.color.primary_blue);
        styleTab(tabWork, !isFavoritesOnly && currentCategory.equals("trabalho"), R.color.work_green);
        styleTab(tabPersonal, !isFavoritesOnly && currentCategory.equals("pessoal"), R.color.personal_purple);
        styleTab(tabFavorites, isFavoritesOnly, R.color.favorite_yellow);
    }

    private void styleTab(TextView tab, boolean isActive, int activeBgColorRes) {
        if (isActive) {
            int bgColor = ContextCompat.getColor(this, activeBgColorRes);
            int textColor = ContextCompat.getColor(this, R.color.tab_active_text);
            ViewCompat.setBackgroundTintList(tab, ColorStateList.valueOf(bgColor));
            tab.setTextColor(textColor);
            tab.setTypeface(null, android.graphics.Typeface.BOLD);
        } else {
            int bgColor = ContextCompat.getColor(this, R.color.tab_inactive_bg);
            int textColor = ContextCompat.getColor(this, R.color.text_secondary);
            ViewCompat.setBackgroundTintList(tab, ColorStateList.valueOf(bgColor));
            tab.setTextColor(textColor);
            tab.setTypeface(null, android.graphics.Typeface.NORMAL);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadNotes();
    }

    @Override
    public void onNoteClick(Note note) {
        Intent intent = new Intent(this, NoteViewerActivity.class);
        intent.putExtra("note_id", note.getId());
        startActivity(intent);
    }

    @Override
    public void onNoteEdit(Note note) {
        Intent intent = new Intent(this, NoteEditorActivity.class);
        intent.putExtra("note_id", note.getId());
        startActivity(intent);
    }

    @Override
    public void onNoteDelete(Note note) {
        new AlertDialog.Builder(this)
                .setTitle("Excluir Anotação")
                .setMessage("Tem certeza de que deseja excluir permanentemente \"" + note.getTitle() + "\"?")
                .setPositiveButton("Excluir", (dialog, which) -> {
                    dbHelper.deleteNote(note.getId());
                    loadNotes();
                    Toast.makeText(this, "Anotação excluída.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }

    @Override
    public void onNoteFavoriteToggle(Note note) {
        boolean nextState = !note.isFavorite();
        dbHelper.toggleFavorite(note.getId(), nextState);
        Toast.makeText(this, nextState ? "Adicionada aos favoritos" : "Removida dos favoritos", Toast.LENGTH_SHORT).show();
        loadNotes();
    }

    @Override
    public void onNotePinToggle(Note note) {
        boolean nextState = !note.isPinned();
        dbHelper.togglePin(note.getId(), nextState);
        Toast.makeText(this, nextState ? "Fixada no topo" : "Desafixada", Toast.LENGTH_SHORT).show();
        loadNotes();
    }

    private void showExitConfirmationDialog() {
        int total = dbHelper.getTotalCount();
        new AlertDialog.Builder(this)
                .setTitle("Sair do Bloco de Notas")
                .setMessage("Deseja sair do aplicativo? Suas " + total + " anotações estão salvas com segurança no dispositivo.")
                .setPositiveButton("Confirmar e Sair", (dialog, which) -> finish())
                .setNegativeButton("Continuar no App", null)
                .show();
    }
}
